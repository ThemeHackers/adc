# Artificial Dynamic Compaction Simulation (ADC)

This document provides a comprehensive overview of the system's Command Console and details every mathematical and physical equation used in the simulation engine.

---

## Table of Contents
1. [Command Console Overview](#1-command-console-overview)
2. [Physics and Mathematical Formulations](#2-physics-and-mathematical-formulations)
   * [Section 1: Tamper Cylinder Geometry](#section-1-tamper-cylinder-geometry)
   * [Section 2: Motion Dynamics & Drag Force](#section-2-motion-dynamics--drag-force)
   * [Section 3: Lifting Dynamics (CHARGING)](#section-3-lifting-dynamics-charging)
   * [Section 4: Electromagnetic Generator & Braking Dynamics (DISCHARGING)](#section-4-electromagnetic-generator--braking-dynamics-discharging)
   * [Section 5: Soil Mechanics & Impact Dynamics (IMPACT)](#section-5-soil-mechanics--impact-dynamics-impact)
   * [Section 6: Battery Equivalent Circuit & Thermodynamics](#section-6-battery-equivalent-circuit--thermodynamics)
   * [Section 7: Sensor Normalization & Calibration](#section-7-sensor-normalization--calibration)
   * [Section 8: Conservation of Mechanical Energy](#section-8-conservation-of-mechanical-energy)
   * [Section 9: Numerical Integration & Sub-stepping (Solving Stiff ODEs)](#section-9-numerical-integration--sub-stepping-solving-stiff-odes)
3. [Soil Database Parameters](#3-soil-database-parameters)
4. [System Operational Workflows](../workflow.md)

---

## 1. Command Console Overview

The **Command Console** acts as the primary control interface for managing the simulation loop and transitioning between the physical states of the system.

### 1.1 State Selectors
These options switch the operational state of the Simulation Engine, altering the underlying mathematical equations being executed:
*   `IDLE`:
    *   **Physical Behavior:** The tamper remains stationary. The motor and generator are completely inactive.
    *   **Energy System:** Solar input is 0. Motor and generator power are 0. Battery current is 0 ($I_{batt} = 0\text{ A}$). The battery cools down naturally toward the ambient temperature ($T_{amb} = 25^\circ\text{C}$).
*   `CHARGING` (Tamper Lifting & Battery Charging):
    *   **Physical Behavior:** The system uses solar input to power the motor, which pulls the cable to lift the tamper up to the maximum height ($15\text{ m}$).
    *   **Energy System:** The motor power ramps up gradually to ensure a smooth transition. The lift velocity is capped at a maximum of $1.5\text{ m/s}$ to maintain simulation stability. Any excess solar power not consumed by the motor is diverted to charge the battery.
*   `DISCHARGING` (Regenerative Sliding Descent):
    *   **Physical Behavior:** The tamper is released and slides down under gravity, pulling the cable to spin the generator.
    *   **Energy System:** The generator produces Back EMF. If this EMF exceeds the battery voltage, current ($I_a$) flows into the battery. The tamper's descent is regulated by electromagnetic braking ($F_{brake}$), allowing it to fall slower than in free fall.
*   `IMPACT` (Free Fall and Impact):
    *   **Physical Behavior:** The tamper falls in free fall under gravity, opposed only by aerodynamic drag.
    *   **Energy System:** Potential energy is converted to kinetic energy. Upon contact with the soil ($h = 0\text{ m}$), the kinetic energy is transferred to the soil, resulting in a peak impact force and crater. If the contact pressure exceeds the soil's ultimate bearing capacity ($q_u$), plastic deformation occurs, and soil density increases.

### 1.2 Simulation Loop Controls
*   `Start Run` / `Pause Run`: Resumes or pauses the numerical solver.
*   `Reset System`: Resets the height, impact counts, soil compaction, and battery temperature to their default initial values.

---

## 2. Physics and Mathematical Formulations

All equations are integrated using a multi-step numerical solver to ensure high stability and accuracy.

### Section 1: Tamper Cylinder Geometry
The tamper is modeled as a solid steel cylinder:

#### 1.1 Cylinder Volume ($V$)
$$V = \frac{m}{\rho_{steel}}$$
*   $V$: Cylinder volume ($\text{m}^3$)
*   $m$: Tamper mass ($\text{kg}$)
*   $\rho_{steel}$: Density of steel $= 7,850\text{ kg/m}^3$ (constant `CYLINDER_DENSITY_STEEL`)

#### 1.2 Cylinder Radius ($r$)
$$r = \sqrt[3]{\frac{V}{\pi \cdot AR}}$$
*   $r$: Base radius ($\text{m}$)
*   $AR$: Aspect Ratio (height-to-radius ratio) $= 3$ (constant `CYLINDER_ASPECT_RATIO_H_TO_R`)

#### 1.3 Cylinder Height ($h_{cyl}$)
$$h_{cyl} = r \cdot AR$$
*   $h_{cyl}$: Height of the cylinder ($\text{m}$)

#### 1.4 Cylinder Base Area ($A_{base}$)
$$A_{base} = \pi \cdot r^2$$
*   $A_{base}$: Contact area during impact and drag ($\text{m}^2$)

---

### Section 2: Motion Dynamics & Drag Force
Aerodynamic drag acts against the velocity vector during descent:

#### 2.1 Drag Force ($F_{drag}$)
$$F_{drag} = \frac{1}{2} \cdot \rho_{air} \cdot C_d \cdot A_{base} \cdot v^2 \cdot \text{sign}(v)$$
*   $F_{drag}$: Aerodynamic drag force ($\text{N}$)
*   $\rho_{air}$: Density of air $= 1.225\text{ kg/m}^3$ (constant `AIR_DENSITY`)
*   $C_d$: Drag coefficient (user-adjustable via the configuration panel)
*   $v$: Velocity ($\text{m/s}$)
*   $\text{sign}(v)$: Direction function (+1 for upward motion, -1 for downward motion)

#### 2.2 Theoretical Terminal Velocity ($v_{terminal}$)
The maximum speed achievable when drag equals the gravitational force:
$$v_{terminal} = \sqrt{\frac{2 \cdot m \cdot g}{\rho_{air} \cdot C_d \cdot A_{base}}}$$
*   $g$: Gravity ($\text{m/s}^2$)

---

### Section 3: Lifting Dynamics (CHARGING)
During the lifting phase, the motor reels in the cable to pull the tamper upward:

#### 3.1 Gravitational Resistance Force ($F_{lift}$)
$$F_{lift} = m \cdot g$$

#### 3.2 Motor Power Ramping ($P_{motor}$)
To prevent numerical instability, motor power is ramped over time:
$$P_{\text{motor\\_next}} = \min\left(P_{\text{motor\\_limit}},\ P_{\text{motor\\_current}} + \text{MOTOR\\_RAMP\\_RATE} \cdot dt_{sub}\right)$$
*   $P_{\text{motor\\_limit}}$: User-configured motor power limit ($\text{W}$)
*   $\text{MOTOR\\_RAMP\\_RATE}$: Power ramp rate $= 180\text{ W/s}$
*   $dt_{sub}$: Sub-stepping time interval ($\text{s}$)

#### 3.3 Lift Velocity ($v_{lift}$)
$$v_{lift} = \min\left(1.5,\ \frac{P_{motor}}{F_{lift}}\right)$$
*   *Note:* The velocity is capped at $1.5\text{ m/s}$ to ensure smooth animation and stable UI rendering.

#### 3.4 Solar System Currents
*   Solar output current ($I_{solar}$):
    $$I_{solar} = \frac{P_{solar}}{V_{batt}}$$
*   Motor consumption current ($I_{motor}$):
    $$I_{motor} = \frac{P_{motor}}{V_{batt}}$$
*   Net battery current ($I_{batt}$):
    $$I_{batt} = I_{solar} - I_{motor}$$
    *   $P_{solar}$: Solar panel power input ($\text{W}$)
    *   $V_{batt}$: Battery open-circuit voltage ($\text{V}$)

---

### Section 4: Electromagnetic Generator & Braking Dynamics (DISCHARGING)
During descent in generator mode, the sliding tamper drives a generator to charge the battery:

#### 4.1 Generator Back EMF ($E_g$)
$$E_g = K_e \cdot G \cdot |v|$$
*   $E_g$: Induced Back EMF ($\text{V}$)
*   $K_e$: Electromotive force constant $= 0.15\text{ V/(rad/s)}$ (constant `GENERATOR_COUPLING_FACTOR`)
*   $G$: Gear ratio
*   $v$: Tamper velocity ($\text{m/s}$)

#### 4.2 Charging Current ($I_a$)
Current flows into the battery only when the Back EMF exceeds the battery terminal voltage:
$$I_a = \max\left(0,\ \frac{E_g - V_{\text{batt}}}{R_{\text{load}} + R_{\text{gen\\_int}} + R_{\text{batt\\_int}}}\right)$$
*   $I_a$: Armature current charging the battery ($\text{A}$)
*   $R_{\text{load}}$: Load resistance ($\Omega$)
*   $R_{\text{gen\\_int}}$: Generator internal resistance $= 0.4\ \Omega$ (constant `GENERATOR_INTERNAL_RESISTANCE`)
*   $R_{\text{batt\\_int}}$: Battery internal resistance ($0.04\ \Omega$ for 24V system, $0.08\ \Omega$ for 48V system)

#### 4.3 Electromagnetic Braking Force ($F_{\text{brake}}$)
$$F_{\text{brake}} = K_t \cdot G \cdot I_a \cdot \text{sign}(v)$$
*   $K_t$: Torque constant $= 0.15\text{ N}\cdot\text{m/A}$ (assuming ideal coupling where $K_t = K_e$)

#### 4.4 Pulley & Cable Friction ($F_{\text{friction}}$)
Mechanical friction scales with mass and velocity to represent cable tension:
$$F_{friction} = \max\left(1,\ (40 + 15 \cdot |v|) \cdot \frac{m}{500}\right)$$

#### 4.5 Power Calculations
*   Generated Power ($P_{\text{gen\\_real}}$):
    $$P_{\text{gen\\_real}} = F_{brake} \cdot |v| \cdot \eta_{gen}$$
*   Load Power ($P_{load}$):
    $$P_{load} = I_a^2 \cdot R_{load}$$
    *   $\eta_{gen}$: Generator efficiency $= 0.9$ (constant `GENERATOR_EFFICIENCY`)

#### 4.6 Equation of Motion
The net upward force and acceleration during descent:
$$F_{\text{net\\_upward}} = -m \cdot g + F_{brake} + |F_{drag}| + F_{friction}$$
$$a = \frac{F_{\text{net\\_upward}}}{m}$$
*   $v_{next} = v + a \cdot dt_{sub}$ (clamped to $\le 0$ as the tamper is falling)

---

### Section 5: Soil Mechanics & Impact Dynamics (IMPACT)
When the height reaches ground level ($h \le 0\text{ m}$), the soil compaction is computed:

#### 5.1 Soil Stiffness ($k_s$)
Soil hardens non-linearly as it gets compacted:
$$k_s = k_0 \cdot \left(1 + 3 \cdot \left(\frac{C_{soil}}{100}\right)^2\right)$$
*   $k_s$: Soil stiffness ($\text{N/m}$)
*   $k_0$: Initial soil stiffness ($\text{N/m}$)
*   $C_{soil}$: Compaction percentage ($0 - 100\%$)

#### 5.2 Kinetic Energy at Impact ($E_k$)
$$E_k = \frac{1}{2} \cdot m \cdot v_{impact}^2$$

#### 5.3 Crater Depth ($d_{crater}$)
Derived using the Work-Energy Theorem ($E_k = \frac{1}{2} k_s d_{crater}^2$):
$$d_{crater} = \sqrt{\frac{2 \cdot E_k}{k_s}}$$

#### 5.4 Peak Impact Force ($F_{peak}$)
$$F_{peak} = k_s \cdot d_{crater} = \sqrt{2 \cdot E_k \cdot k_s}$$

#### 5.5 Contact Pressure ($P_{contact}$)
$$P_{contact} = \frac{F_{peak}}{A_{base}}$$

#### 5.6 Plastic Compaction Threshold
Soil compaction occurs permanently only when contact pressure exceeds the ultimate bearing capacity ($q_u$):
$$\text{Plastic deformation occurs when: } P_{contact} > q_u$$

#### 5.7 Compaction Increase ($\Delta C_{soil}$)
If the bearing capacity is exceeded, compaction increases, with a single-impact limit of $15\%$:
$$\Delta C_{soil} = \min\left(15,\ \left(\frac{P_{contact}}{q_u} - 1.0\right) \cdot 1.5 \cdot \left(1.0 - \frac{C_{soil}}{100}\right) + 0.5\right)$$
*   Updated Compaction: $C_{\text{soil\\_next}} = \min(100,\ C_{soil} + \Delta C_{soil})$

#### 5.8 Physical Soil Density ($\rho_{soil}$)
$$\rho_{soil} = \rho_{initial} + \frac{C_{soil}}{100} \cdot (\rho_{max} - \rho_{initial})$$

---

### Section 6: Battery Equivalent Circuit & Thermodynamics
A Li-ion battery is simulated using an equivalent circuit and thermal model:

#### 6.1 Battery Open Circuit Voltage ($V_{oc}$)
OCV varies linearly with the State of Charge ($SoC$):
*   **24V System:**
    $$V_{oc} = 22.0 + \frac{SoC}{100} \cdot 6.0$$
*   **48V System:**
    $$V_{oc} = 44.0 + \frac{SoC}{100} \cdot 12.0$$

#### 6.2 Battery Internal Resistance ($R_{\text{batt\\_int}}$)
*   24V System: $R_{\text{batt\\_int}} = 0.04\ \Omega$
*   48V System: $R_{\text{batt\\_int}} = 0.08\ \Omega$

#### 6.3 Terminal Voltage ($V_{terminal}$)
$$V_{terminal} = \max\left(0,\ V_{oc} + I_{batt} \cdot R_{\text{batt\\_int}}\right)$$
*   $I_{batt}$: Net current (positive for charging, negative for discharging)

#### 6.4 Capacity Delta ($\Delta Capacity\%$)
$$\Delta Capacity\% = \frac{I_{batt} \cdot dt_{sub}}{\text{Capacity}_{Ah} \cdot 3,600} \cdot 100$$
*   $\text{Capacity}_{Ah}$: Battery reference capacity $= 50\text{ Ah}$ (constant `BATTERY_REFERENCE_CAPACITY_AH`)

#### 6.5 Thermal Loss and Temperature ($T_{batt}$)
*   Internal Joule heating power ($P_{heat}$):
    $$P_{heat} = I_{batt}^2 \cdot R_{\text{batt\\_int}}$$
*   Convective cooling power ($P_{cool}$):
    $$P_{cool} = h_{cool} \cdot (T_{batt} - T_{amb})$$
    *   $h_{cool}$: Cooling coefficient $= 1.5\text{ W/K}$ (constant `BATTERY_COOLING_COEFF`)
    *   $T_{amb}$: Ambient temperature $= 25.0^\circ\text{C}$ (constant `AMBIENT_TEMP`)
*   Temperature rate of change ($\frac{dT_{batt}}{dt}$):
    $$\frac{dT_{batt}}{dt} = \frac{P_{heat} - P_{cool}}{C_{thermal}}$$
    *   $C_{thermal}$: Battery thermal mass $= 1,200\text{ J/K}$ (constant `BATTERY_THERMAL_MASS`)
*   Updated Temperature:
    $$T_{\text{batt\\_next}} = \max\left(25.0,\ T_{batt} + \frac{dT_{batt}}{dt} \cdot dt_{sub}\right)$$

---

### Section 7: Sensor Normalization & Calibration
Used to convert analog sensor signals (e.g., 12-bit ADC inputs) into physical values:

#### 7.1 Normalization (0 to 1 range)
$$normalized = \max\left(0,\ \min\left(1,\ \frac{rawValue - minRaw}{maxRaw - minRaw}\right)\right)$$
*   $rawValue$: Raw ADC reading ($0 - 4095$)

#### 7.2 Linear Calibration
$$calibrated = (minCalibrated + normalized \cdot (maxCalibrated - minCalibrated) + offset) \cdot scale$$

---

### Section 8: Conservation of Mechanical Energy
Calculates mechanical energy properties of the tamper:

#### 8.1 Potential Energy ($E_p$)
$$E_p = m \cdot g \cdot h$$

#### 8.2 Kinetic Energy ($E_k$)
$$E_k = \frac{1}{2} \cdot m \cdot v^2$$

#### 8.3 Total Mechanical Energy ($E_{total}$)
$$E_{total} = E_p + E_k$$

---

### Section 9: Numerical Integration & Sub-stepping (Solving Stiff ODEs)
*   **Stiff ODEs Challenge:**
    High gear ratios ($G = 250 - 1000$) or compacting rigid soils ($k_s \approx 8.0 \times 10^6\text{ N/m}$) yield stiff differential equations. Standard Explicit Euler methods with a default $dt = 50\text{ ms}$ (20Hz) lead to numerical instability, causing parameters to fluctuate wildly (jittering/blinking numbers).
*   **Sub-stepping Integration:**
    To resolve this, the system breaks down the standard time-step ($dt = 50\text{ ms}$) into $10$ smaller sub-steps:
    $$dt_{sub} = \frac{dt}{10} = 5\text{ ms} = 0.005\text{ s}$$
    The equations of motion are integrated $10$ times consecutively within each simulation frame, ensuring numerical stability, smoothness, and accuracy under all parameter selections.

---

## 3. Soil Database Parameters

The database includes specific parameters for 4 distinct soil types:

| Soil Type | $k_0$ (Initial Stiffness - N/m) | $q_u$ (Ultimate Bearing Capacity - Pa) | $\rho_{initial}$ (Initial Density - kg/m³) | $\rho_{max}$ (Max Density - kg/m³) |
| :--- | :--- | :--- | :--- | :--- |
| **Sand** | $2.0 \times 10^6$ | $200 \times 10^3$ | $1,500$ | $1,900$ |
| **Clay** | $1.0 \times 10^6$ | $100 \times 10^3$ | $1,600$ | $1,800$ |
| **Gravel** | $8.0 \times 10^6$ | $600 \times 10^3$ | $1,800$ | $2,200$ |
| **Loam** | $1.5 \times 10^6$ | $150 \times 10^3$ | $1,400$ | $1,850$ |

---

## 4. System Operational Workflows

For detailed visual diagrams of state transitions, sub-stepping loop sequences, and sub-system workflow architectures, refer to the [Operational Workflow](workflow.md) document.
