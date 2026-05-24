# ADC Hardware System Simulator

ระบบจำลอง hardware server สำหรับ ADC dashboard

## Run

```bash
npm start
```

## API

- `GET /api/health`
- `GET /api/hardware/data`
- `GET /api/hardware/state`
- `GET /api/hardware/workflow`
- `POST /api/hardware/state`
- `POST /api/hardware/reset`

## Default ports

- Dashboard bridge: `http://localhost:3001`
- Hardware simulation API: `http://localhost:3002`

## Test

```bash
npm test
```