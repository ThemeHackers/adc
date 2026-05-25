# ADC Simulation Operational Workflow

This document details the system-by-system workflows inside the Artificial Dynamic Compaction (ADC) Simulation system.

---

## 1. High-Level Operational Workflow

Below is the state transition and physical simulation loop flowchart representing how the console operates.

```mermaid
graph TD
    A[Start: Initialization / IDLE State] --> B{Select Control Mode}
    B -->|CHARGING| C[Phase 1: Tamper Lifting]
    B -->|DISCHARGING| D[Phase 2: Regenerative Slide]
    B -->|IMPACT| E[Phase 3: Free Fall Impact]
    B -->|RESET| F[Reset Parameters to Default]
    
    C --> C1[Solar Power Inputs to Motor]
    C1 --> C2[Motor Power Ramps Up]
    C2 --> C3[Tamper Climbs: Max Speed Capped at 1.5 m/s]
    C3 --> C4{Height >= Max Height?}
    C4 -->|No| C3
    C4 -->|Yes| C5[Auto-Switch to DISCHARGING]
    
    D --> D1[Tamper Released & Slides Down]
    D1 --> D2[Generator Rotates: Back EMF Induced]
    D2 --> D3{EMF > Battery Voltage?}
    D3 -->|Yes| D4[Current Conduction: Battery Charges]
    D3 -->|No| D5[Blocked by Rectifier: Current = 0]
    D4 --> D6[EM Braking & Pulley Friction Slow Descent]
    D5 --> D6
    D6 --> D7{Height <= Ground Level?}
    D7 -->|No| D1
    D7 -->|Yes| D8[Switch to IDLE]
    
    E --> E1[Tamper in Free Fall]
    E1 --> E2[Aerodynamic Drag Opposes Motion]
    E2 --> E3{Height <= Ground Level?}
    E3 -->|No| E1
    E3 -->|Yes| E4[Impact Event: Compute Kinetic Energy]
    E4 --> E5[Compute Peak Force & Crater Depth]
    E5 --> E6{Contact Pressure > Bearing Capacity?}
    E6 -->|Yes| E7[Plastic Compaction: Permanent Density Increase]
    E6 -->|No| E8[Elastic Deformation Only: Density Constant]
    E7 --> E9[Switch to IDLE & Await Next Loop]
    E8 --> E9
```

---

## 2. Simulation Loop Sequence Workflow

The simulation engine runs at 20Hz ($50\text{ ms}$ intervals). To ensure numerical stability for stiff differential equations, a sub-stepping execution model is used:

```mermaid
sequenceDiagram
    participant UI as User Interface (Dashboard)
    participant Engine as Simulation Engine
    participant Form as Mathematical Formulas
    participant Logger as Data Logger
    
    loop Every 50ms Frame (Sub-stepping)
        Engine->>Engine: Split dt into 10 Sub-steps (5ms each)
        loop 10 Iterations
            alt State is CHARGING
                Engine->>Form: Calculate Motor Power & Battery Delta
                Form-->>Engine: Updated Power & Capacity
                Engine->>Engine: Update Tamper Height & Velocity
            else State is DISCHARGING
                Engine->>Form: Calculate Back EMF, Current & Braking Force
                Form-->>Engine: EMF, I_a, F_brake
                Engine->>Engine: Update Velocity & Height via Euler Solver
            else State is IMPACT (Falling)
                Engine->>Form: Calculate Aerodynamic Drag Force
                Form-->>Engine: Drag Force (F_drag)
                Engine->>Engine: Update Velocity & Height via Euler Solver
                alt Height <= 0
                    Engine->>Form: Calculate Impact Mechanics (Force, Crater, Plastic deformation)
                    Form-->>Engine: Peak Force, Crater Depth, Soil compaction delta
                    Engine->>Engine: Update Compaction % & Density, Switch to IDLE
                end
            end
        end
        Engine->>Logger: Log Current Frame Data
        Logger-->>UI: Real-Time Telemetry & Charts Update
    end
```

---

## 3. Sub-System Details

### 3.1 Solar-Motor Lifting Sub-System
1.  **Solar Input Detection:** Reads solar configuration limits ($P_{solar}$).
2.  **Motor Engagement:** Power is ramped up incrementally ($P_{motor} = P_{motor} + 180\text{ W/s} \times dt_{sub}$).
3.  **Lifting Velocity Solver:**
    $$v_{lift} = \min\left(1.5, \frac{P_{motor}}{m \cdot g}\right)$$
4.  **Position Integration:** Updates height ($h_{next} = h + v_{lift} \cdot dt_{sub}$).
5.  **State Transition:** When $h \ge h_{max}$ ($15\text{ m}$), the system triggers an automatic switch to `DISCHARGING`.

### 3.2 Regenerative Generator Sub-System
1.  **Gravity Release:** Tamper falls under gravity, generating velocity $v$.
2.  **Back EMF Generation:** The spinning pulley generates EMF ($E_g = 0.15 \cdot G \cdot |v|$).
3.  **Rectification Block:** Current flows only if Back EMF exceeds the battery voltage:
    $$I_a = \max\left(0, \frac{E_g - V_{batt}}{R_{load} + R_{\text{gen\_int}}}\right)$$
4.  **Braking Torque Feedback:** The armature current induces electromagnetic braking:
    $$F_{brake} = 0.15 \cdot G \cdot I_a$$
5.  **Euler Numerical Integration:** Accurately solves the equation of motion:
    $$a = g - \frac{F_{brake} + F_{drag} + F_{friction}}{m}$$
    $$v_{next} = v + a \cdot dt_{sub}$$
    $$h_{next} = h + v \cdot dt_{sub}$$

### 3.3 Dynamic Impact Compaction Sub-System
1.  **Free Fall:** Tamper is dropped from height $h$ in free fall, subject only to gravity and aerodynamic drag.
2.  **Kinetic Energy Capture:** At $h \le 0$, the impact velocity is used to calculate the kinetic energy:
    $$E_k = \frac{1}{2} m v^2$$
3.  **Soil Reaction Solver:** Computes soil stiffness ($k_s$) based on current soil compaction percentage:
    $$k_s = k_0 \cdot \left(1 + 3 \cdot \left(\frac{C_{soil}}{100}\right)^2\right)$$
4.  **Crater and Force Calculation:**
    $$d_{crater} = \sqrt{\frac{2 \cdot E_k}{k_s}}$$
    $$F_{peak} = k_s \cdot d_{crater}$$
    $$P_{contact} = \frac{F_{peak}}{A_{base}}$$
5.  **Compaction Evaluation:**
    *   If $P_{contact} > q_u$ (Soil Ultimate Bearing Capacity): Plastic deformation occurs. Soil compaction percentage is permanently increased:
        $$\Delta C_{soil} = \min\left(15,\ \left(\frac{P_{contact}}{q_u} - 1.0\right) \cdot 1.5 \cdot \left(1.0 - \frac{C_{soil}}{100}\right) + 0.5\right)$$
    *   If $P_{contact} \le q_u$: Elastic deformation only. Soil compaction percentage remains unchanged.
6.  **Soil Density Update:**
    $$\rho_{soil} = \rho_{initial} + \frac{C_{soil}}{100} \cdot (\rho_{max} - \rho_{initial})$$

### 3.4 Battery & Thermal Sub-System
1.  **State of Charge (SoC):** Integrates current $I_{batt}$ over time to update battery capacity.
2.  **Terminal Voltage Drop:**
    $$V_{terminal} = V_{oc} + I_{batt} \cdot R_{\text{batt\_int}}$$
3.  **Joule Heating Calculation:**
    $$P_{heat} = I_{batt}^2 \cdot R_{\text{batt\_int}}$$
4.  **Convective Cooling Dissipation:**
    $$P_{cool} = 1.5\text{ W/K} \cdot (T_{batt} - 25^\circ\text{C})$$
5.  **Thermal Solver:**
    $$\frac{dT_{batt}}{dt} = \frac{P_{heat} - P_{cool}}{1200\text{ J/K}}$$
    $$T_{\text{batt\_next}} = T_{batt} + \frac{dT_{batt}}{dt} \cdot dt_{sub}$$
6.  **Safety Alert:** Triggers warning if $T_{batt} > 45^\circ\text{C}$.

---

## 4. Configuration Tuning Workflow

To customize and test the simulation parameters, utilize the following workflow:

```mermaid
stateDiagram-v2
    [*] --> SelectScenario: Choose Scenario Preset
    SelectScenario --> CustomizeParameters: Open Config Panel
    CustomizeParameters --> AdjustTamper: Set Tamper Mass / Max Height
    CustomizeParameters --> AdjustSoil: Set Soil Type / Density
    CustomizeParameters --> AdjustDriveSystem: Set Solar Power / Gear Ratio / Resistance
    AdjustTamper --> ValidateConfig: Save Configuration
    AdjustSoil --> ValidateConfig
    AdjustDriveSystem --> ValidateConfig
    ValidateConfig --> RunSimulation: Run & Observe Telemetry
    RunSimulation --> [*]
```
