const int NUM_SENSORS = 6; // Define the number of sensors
int base[NUM_SENSORS];     // Array to store baseline readings
int current[NUM_SENSORS];  // Array to store current readings

const int DIFFERENCE_THRESHOLD = 50; // Threshold for detecting a significant change

void setup() {
  Serial.begin(9600); // Start serial communication at 9600 baud
  
  // Initialize baseline readings for all sensors
  for (int i = 0; i < NUM_SENSORS; i++) {
    base[i] = analogRead(A7 - i); // Read initial sensor value and store it as the baseline
  }
}

void loop() {
  // Read all sensors and print only 0 or 1
  for (int i = 0; i < NUM_SENSORS; i++) {
    current[i] = analogRead(A0 + i); // Read current sensor value
    
    // Determine if the difference from baseline exceeds the threshold
    int status = (current[i] - base[i] >= DIFFERENCE_THRESHOLD) ? 1 : 0;

    Serial.print(status); // Print only 0 or 1

    if (i < NUM_SENSORS - 1) {
      Serial.print(","); // Separate values with commas
    }
  }

  Serial.println();
  
  delay(50);
}