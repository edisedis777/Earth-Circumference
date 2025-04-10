# Eratosthenes Earth Circumference Visualization

![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)



Explore how Eratosthenes measured Earth's circumference over 2,200 years ago using simple observations and geometry. This interactive web application brings his ancient experiment to life with dynamic visualizations and user controls.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Overview

In 240 BCE, Eratosthenes calculated Earth's circumference with remarkable accuracy by observing shadows in Syene and Alexandria. This project recreates his method through an educational and interactive interface built with HTML, CSS, and JavaScript. Users can adjust time of day, shadow angles, and city distances to see how these variables affect the calculated circumference, visualized on both a 2D sun demo and a 3D Earth model.

## Features

- **Interactive Sun Demo:** Adjust the time of day to see how shadows change in Syene and Alexandria.
- **Earth Model:** Visualize the angular difference and distance between cities on a rotating Earth.
- **Dynamic Calculations:** Modify shadow angle and distance to recalculate Earth's circumference in real-time.
- **Dark Mode:** Toggle between light and dark themes for better accessibility.
- **Responsive Design:** Works seamlessly on desktop and mobile devices.
- **Accessibility:** Includes ARIA live regions for screen reader support.

## Demo

Try the live demo [here](#)

## Installation

To run this project locally:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/username/eratosthenes-circumference.git
   cd eratosthenes-circumference
   ```

2. **Open in Browser:**
   - Simply open `index.html` in a modern web browser (e.g., Chrome, Firefox, Edge).
   - No server or dependencies required!

3. **Optional: Serve Locally:**
   If you prefer a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   ```
   Then navigate to `http://localhost:8000` in your browser.

## Usage

1. **Sun Demo Section:**
   - Use the "Time of Day" slider to move the sun and observe shadow changes.
   - Click "Reset" to return to noon.

2. **Calculation Section:**
   - Adjust the "Shadow Angle" (1° to 15°) and "Distance" (1000 to 10000 stadia) sliders.
   - See the updated circumference calculation instantly.

3. **Earth Model Section:**
   - Click "Rotate Earth" to start/stop rotation.
   - Toggle "Show Angles" to display/hide the angle and distance annotations.
   - Reset the animation with "Reset Animation" (appears dynamically).

4. **Dark Mode:**
   - Click "Toggle Dark Mode" in the top-right corner to switch themes.


## Contributing

Contributions are welcome!

## License

This project is licensed under the [MIT License](LICENSE). 
