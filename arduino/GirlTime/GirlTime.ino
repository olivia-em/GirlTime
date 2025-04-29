// #include <Adafruit_VL53L0X.h>

const int NUM_SENSORS = 6;
const int sensorPins[NUM_SENSORS] = { A0, A1, A2, A3, A6, A7 };
int base[NUM_SENSORS];
int current[NUM_SENSORS];
const int DIFFERENCE_THRESHOLD = 50;

// Adafruit_VL53L0X lox = Adafruit_VL53L0X();

void setup() {
  Serial.begin(115200);

  // Initialize analog baseline
  for (int i = 0; i < NUM_SENSORS; i++) {
    base[i] = analogRead(sensorPins[i]);
  }

  // // Initialize ToF sensor
  // if (!lox.begin()) {
  //   Serial.println(F("Failed to boot VL53L0X"));
  //   while (1)
  //     ;  // Halt
  // }
}

void loop() {
  // Read current analog values and print status
  for (int i = 0; i < NUM_SENSORS; i++) {
    current[i] = analogRead(sensorPins[i]);
    int status = (abs(current[i] - base[i]) >= DIFFERENCE_THRESHOLD) ? 1 : 0;
    Serial.print(status);
    if (i < NUM_SENSORS - 1) Serial.print(",");
  }

  // // Read VL53L0X distance
  // VL53L0X_RangingMeasurementData_t measure;
  // lox.rangingTest(&measure, false);

  // Serial.print(",");
  // // Print valid range measurement
  // if (measure.RangeStatus != 4) {
  //   // Serial.print(" | Distance: ");
  //   // int mappedTOF = map(measure.RangeMilliMeter, 0, 600, 600, 0);
  //   // Serial.print(mappedTOF);
  //   Serial.print(int(measure.RangeMilliMeter));
  // } else {
  //   Serial.print("0");
  // }

  Serial.println();
  delay(100);
}