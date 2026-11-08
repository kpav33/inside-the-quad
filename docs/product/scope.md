# Inside the Quad — Content Scope

## Goal

An interactive web app that teaches beginners **how an FPV drone works, part by part**, so they understand the hardware they're buying, building or repairing.

- **Audience:** complete beginners (no electronics or RC background assumed)
- **Focus:** hardware and how it works together. Not shopping, tuning or flying technique.
- **Reference drone:** a typical **5" freestyle quad**: every part is a separate, visible component, and it's the standard most pilots learn on.
- **Later:** expand to other FPV sizes (tiny whoop, 3", 7" long range), then other drone types.

### Reference drone spec (used for the 3D model and all examples)

| Part | Typical 5" spec |
|---|---|
| Frame | Carbon fibre, ~220–230 mm wheelbase, 30.5 × 30.5 mm stack mount |
| Motors | 4 × 2207 or 2306 size, ~1750–1950 KV (6S) or ~2400–2700 KV (4S) |
| Props | 5" tri-blade, e.g. 5 × 4.3 × 3 |
| ESC | 4-in-1, ~45–60 A per motor |
| Flight controller | F4/F7/H7 processor, gyro, running Betaflight |
| Battery | 6S 1100 mAh or 4S 1500 mAh LiPo, XT60 connector |
| Receiver | ExpressLRS (ELRS) 2.4 GHz |
| Video | Analog (camera + VTX) or digital (e.g. DJI, Walksnail, HDZero) |
| Weight | ~600–800 g with battery |
| Flight time | ~4–7 minutes |

---

## Module 1 — What is an FPV drone?

Short intro before the hardware.

- **FPV vs camera drones:** FPV = you see live from the drone through goggles. Camera drones (like DJI Mini/Mavic) hold position for you; FPV drones are flown manually, which is harder but much more free.
- **The whole system:** the drone, the radio in your hands, and the goggles on your head. Three devices, two wireless links.
- **Sizes:** drones are named by prop size (tiny whoop ~65–75 mm, 3", 5", 7"). Quick visual size comparison.
- **What "5-inch" means** and why it's the reference here.

**Interactive idea:** a scene with pilot, radio, drone and goggles, showing the two wireless links (control going up, video coming down).

---

## Module 2 — The parts (the core of the app)

Each part gets its own lesson. Every lesson answers the same four questions:
1. **What does it do?** (one sentence, plain language)
2. **How does it work?**
3. **What do the numbers on it mean?** (specs)
4. **What is it connected to?** (highlight the wires/links in 3D)

### 2.1 Frame
- The skeleton: top plate, bottom plate, arms, standoffs
- Carbon fibre: stiff, light, strong (and conductive, so wires must not short against it)
- Frame shapes: true X, stretched X, squashed X, "deadcat" (arms moved so props stay out of the camera view)
- **Mounting patterns:** the stack mounts at 30.5 × 30.5, 25.5 × 25.5 or 20 × 20 mm. Parts only fit if the holes match.
- Where everything sits: stack in the middle, camera at the front, VTX/receiver at the back, battery on top

### 2.2 Motors
- **Brushless motors:** no brushes. The ESC switches the coils on and off in sequence, the magnets in the bell chase them, and the bell spins.
- Parts: stator (coils, fixed), bell (magnets, spins), shaft, bearings
- **Size naming:** 2207 = stator 22 mm wide, 7 mm tall. Bigger stator = more torque.
- **KV:** roughly RPM per volt with no load. Higher KV spins faster but draws more current, so higher KV pairs with lower-voltage batteries (4S) and lower KV with higher voltage (6S).
- 3 wires per motor; swapping any two reverses the direction
- Mounting: 16 × 16 mm screw pattern, M5 threaded shaft on 5" motors

### 2.3 Propellers
- **Size code:** 5 × 4.3 × 3 = 5" diameter, 4.3" pitch (how far it would "screw" forward per turn), 3 blades
- More pitch / more blades = more grip and thrust, but more current draw
- **Two directions:** 2 props spin clockwise, 2 counter-clockwise. This cancels out the twisting force, so the drone doesn't spin.
- **Props-in vs props-out:** which way the front props spin. Must match what's set in the flight controller.
- Prop on the wrong motor or backwards = the drone flips on takeoff

### 2.4 ESC (Electronic Speed Controller)
- Turns the flight controller's "spin at X%" command into the high-current, 3-phase power that drives each motor
- **4-in-1 ESC:** four ESCs on one board, sitting under the flight controller in the "stack"
- **Current rating:** e.g. 50 A per motor. Too low and it burns out.
- It has its own little processor and firmware (e.g. BLHeli_S, Bluejay, AM32)
- **Sensorless:** it figures out where the motor is in its rotation by measuring the voltage the spinning motor feeds back (back-EMF)
- **DShot:** the digital "language" between FC and ESC (DShot300/600 = speed)
- The battery connects here first, through the **capacitor** (protects electronics from voltage spikes)

### 2.5 Battery (LiPo)
- **Cells and "S":** each LiPo cell is 3.7 V nominal, 4.2 V full. 6S = 6 cells in series = 22.2 V nominal, 25.2 V full.
- **Key voltages per cell:** 4.2 V full · 3.8 V storage · ~3.5 V basically empty · don't go below ~3.3 V resting
- **Capacity (mAh):** how much energy. More = longer flights but heavier.
- **C-rating:** how fast it can deliver current (often exaggerated on labels)
- **Voltage sag:** voltage drops under heavy throttle and recovers when you ease off
- **Connectors:** XT60 (main power), balance lead (used by the charger to keep cells equal)
- **Safety:** puffed or damaged = retire it; charge on a fireproof surface, never unattended; storage-charge if not flying for a few days

**Interactive idea:** a battery with a throttle slider showing voltage sag and remaining charge.

### 2.6 Flight controller (FC)
- **The brain.** Reads your stick commands and the gyro thousands of times per second, then decides how fast each motor should spin.
- **Gyro (IMU):** measures how fast the drone is rotating on each axis. It's the most important sensor on the drone.
- **Processor:** F4 / F7 / H7 (generations of chip; newer = more processing headroom)
- **Firmware:** Betaflight is the standard for freestyle/racing (INAV and ArduPilot for autonomous/GPS flying)
- **UARTs:** serial ports where the receiver, VTX and GPS plug in
- **BEC:** onboard regulators that turn battery voltage into 5 V / 9–10 V for cameras, receivers, VTXs
- Sits on top of the ESC on rubber grommets (soft mounting, to keep vibration out of the gyro)
- **AIO boards:** FC + ESC (sometimes receiver/VTX too) on one board, common on small drones

### 2.7 Radio receiver (RX)
- Tiny board that receives your stick commands from the radio and passes them to the FC
- **ExpressLRS (ELRS):** the current standard. Open source, 2.4 GHz (or 900 MHz for long range), very low latency.
- **Binding:** pairing the receiver to your radio
- Connects to the FC over a serial port (CRSF protocol)
- **Telemetry:** sends info back to your radio (battery voltage, signal quality)
- **Failsafe:** what happens when the signal is lost (the drone drops or, with GPS, flies home)
- Antenna placement matters: away from carbon and motors

### 2.8 FPV camera
- Captures the live video you see in the goggles (low latency matters more than image quality)
- **Sizes:** full (28 mm), mini (21 mm), micro (19 mm), nano (14 mm). Must fit the frame.
- **Camera angle:** tilted up (~25–45°) so you can see ahead when the drone tilts forward at speed. More angle = more comfortable flying fast.
- Separate from an HD action camera (GoPro) people mount on top for nice footage

### 2.9 Video transmitter (VTX) and antennas
- Sends the camera image wirelessly to your goggles
- **Analog:** cheap, lowest latency, fuzzy picture. 5.8 GHz, many channels.
- **Digital:** DJI, Walksnail, HDZero, OpenIPC. Sharp HD picture, more expensive; the camera and VTX come as a matched set.
- **Channels and bands:** each pilot needs their own channel or they ruin each other's video
- **Power (mW):** more power = more range and more heat. Legal limits vary by country (in much of the EU, 25 mW).
- **OSD:** text overlay in your goggles (battery voltage, timer), added by the FC
- **Antennas:** polarization (RHCP / LHCP) must match on drone and goggles
- **Never power a VTX without its antenna attached** (it can burn out)

### 2.10 Extras
- **GPS:** shows speed/distance, enables GPS Rescue (flies home if signal is lost)
- **Buzzer:** helps find a crashed drone
- **LEDs:** visibility and fun
- **Battery strap and pad:** small, but a lost battery = a crash

---

## Module 3 — How it all works together (the simulator)

The centerpiece. Three animated "paths" through the 3D drone:

1. **Control path:** sticks → radio → ELRS link → receiver → FC (+ gyro) → ESC → motors
2. **Power path:** battery → capacitor → 4-in-1 ESC → motors; ESC/FC regulators → FC, receiver, camera, VTX
3. **Video path:** camera → VTX → antenna → goggles (FC adds the OSD on the way)

### How a quad actually moves
- **Up/down (throttle):** all four motors faster/slower
- **Roll and pitch:** motors on one side spin faster than the other side, so the drone tilts, and the thrust pushes it that way
- **Yaw (rotation):** the CW pair speeds up and the CCW pair slows down (or vice versa); the twisting forces no longer cancel and the drone rotates
- **The gyro loop:** the FC constantly compares "what the pilot asked for" with "what the gyro measures" and corrects, thousands of times per second. That's why the drone is stable at all.

**Interactive ideas:**
- Virtual sticks: move them and watch each motor's speed change
- "What if" mode: unplug the receiver (failsafe), prop on backwards (flip on takeoff), swap 4S ↔ 6S (speed/heat), VTX without antenna (warning)

---

## Module 4 — The gear you hold and wear

- **Radio transmitter:** two sticks (gimbals), mode 2 layout (left = throttle + yaw, right = pitch + roll), switches (arm, flight mode), ELRS module inside, EdgeTX firmware
- **Goggles:** a video receiver plus screens; analog vs digital must match the drone's VTX
- **Charger:** balance charging, storage mode, why a good charger matters

---

## Later: compatibility checker

Built from the specs already covered in Module 2:
- Stack mounting size: FC/ESC vs frame (30.5 / 25.5 / 20 mm)
- Camera width vs frame (28 / 21 / 19 / 14 mm)
- Motor mount vs frame arms (16 mm on 5")
- Prop size vs frame size
- Voltage: battery "S" vs ESC, FC, VTX, camera ratings
- Motor KV vs battery voltage
- Video system: VTX vs goggles

---

## Out of scope (for now)

- Product recommendations and buying guides (go stale quickly; link out instead)
- Betaflight configuration, rates, PID tuning
- How to fly / flight training
- Other drone types (planned for later)

---

## Sources

- [A comprehensive guide to FPV drone technology — Cal Bryant](https://calbryant.uk/blog/a-comprehensive-guide-to-fpv-drone-technology/)
- [How To Get Started With FPV Drone — Oscar Liang](https://oscarliang.com/fpv-drone-guide/)
