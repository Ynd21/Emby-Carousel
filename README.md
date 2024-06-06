
![Logo](https://i.imgur.com/VhsMN01.jpeg)


# 🎥 Emby New Movie Carousel on Home Page 🌟

This project enhances the visual appeal and functionality of the Emby web interface by adding a custom carousel to the home page. The carousel dynamically displays the latest movies with a smooth fade transition that blends seamlessly into the Emby background. Additionally, this project ensures that the carousel's header remains transparent and overlays the carousel content effectively.

## Changes Made

- Added a Custom Carousel
Integrated a carousel at the top of the home page to showcase the latest movies.
Configured the carousel to auto-play, change slides every 60 seconds, and include navigation dots.
Ensured the carousel images have rounded corners and a smooth fade transition into the Emby background.
- Adjusted Header Position
Positioned the Emby header to overlay the carousel content.
Made the header background transparent to enhance the visual integration with the carousel.
- Enhanced Readability
Applied a shadow to the header buttons to ensure readability over the carousel images.


## Contributing

Contributions are always welcome! Submit a request! 


## Run the bot

Clone the project

```bash
  git clone https://github.com/Ynd21/Emby-Carousel.git
```

Mount index.html and homesections.js to the following locations

```bash
  /app/emby/system/dashboard-ui/modules/homesections/homesections.js
  /app/emby/system/dashboard-ui/index.html
```

Restart Emby Docker Container/Server




## Custom CSS

Custom CSS you add to Emby via Settings

```css
/* Carousel Container Styling */
.carousel {
    width: 100%;
    margin: 0 auto;
}

.carousel .carousel-image-container {
    position: relative;
    text-align: center;
}

.carousel .carousel-image {
    width: 100%;
    max-height: 600px;
    object-fit: cover;
    display: block;
    border-radius: 20px;
}

.carousel .carousel-caption {
    position: absolute;
    bottom: 20px;
    left: 20px;
    color: white;
    text-align: left;
    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; /* Black stroke */
}

.carousel .carousel-logo img {
    max-width: 300px;
}

.carousel .carousel-tagline {
    font-size: 1.2em;
    margin: 10px 0;
}

.carousel .carousel-button {
    display: inline-block;
    background-color: #e50914;
    color: white;
    padding: 10px 20px;
    text-decoration: none;
    border-radius: 5px;
    font-size: 1em;
}

/* Gradient Fade Effect */
.carousel-image-container::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100px; /* Adjust as needed */
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0), #1c1c1c);
    pointer-events: none; /* So it doesn't block clicks */
    border-bottom-left-radius: 20px; /* To match the border radius of the image */
    border-bottom-right-radius: 20px; /* To match the border radius of the image */
}

/* Header Styling */
.skinHeader {
    z-index: 1;
    display: flex;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    box-sizing: border-box;
    height: var(--header-height);
    align-items: flex-start;
    contain: strict;
    padding-top: 1.2em;
    padding-left: 0;
    padding-left: env(safe-area-inset-left, 0);
    padding-right: 0;
    padding-right: env(safe-area-inset-right, 0);
    align-content: flex-start;
    flex-wrap: wrap;
    background: transparent !important; /* Make header background transparent */
    margin-top: -60px; /* Adjust to overlap the carousel */
}

/* Header Button Styling */
.paper-icon-button-light {
    color: white;
    text-shadow: 0 0 5px rgba(0, 0, 0, 0.7); /* Add shadow for readability */
}
```
    
