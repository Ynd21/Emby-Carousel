
![Logo](https://i.imgur.com/A6pXNPS.png)
# Fly out Menu Changes
![Menu](https://i.imgur.com/GhCWBWn.png)


# 🎥 Emby New Movie Carousel 🌟

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

## Bugs
- Expect Bugs. I know on mobile the carousel doesn't load, and at times hitting Home will also fail to load the carousel 

## How to use

Clone the project

```bash
  git clone https://github.com/Ynd21/Emby-Carousel.git
```

Mount index.html and homesections.js to the following locations

```bash
  /app/emby/system/dashboard-ui/modules/homesections/homesections.js
  /app/emby/system/dashboard-ui/index.html
```

## Additional Edits - Add Requests Link to your Fly Out Menu

Edit navdrawercontent.js and goto line 347 - Change this line to your Requests system
```
window.open('https://YOUR.LINK.HERE', '_blank', 'noopener noreferrer');
```

Mount navdrawercontent
```bash
/app/emby/system/dashboard-ui/modules/navdrawer/navdrawercontent.js
```

Restart Emby Docker Container/Server




## Custom CSS

Custom CSS you add to Emby via Settings

```css
/* Ensure the carousel and its elements use the full width */
.carousel-container {
    position: relative;
    margin-top: -5.525em; /* Adjust to overlap the header */
    z-index: 1; /* Ensure it's below the header */
    width: 100vw; /* Full viewport width */
    overflow: hidden; /* Hide overflow to prevent neighboring slides from being visible */
}
/* Positioning for section0 to ensure it appears in the middle right of the screen */
.verticalSection.section0 {
    top: -25%;
    right: 1;
    z-index: 100;
    left: 40%;
    animation: bounceIn 1s ease-out forwards; /* Bounce-in animation from the right */
}

/* Keyframes for bounce-in effect */
@keyframes bounceIn {
    0% {
        transform: translateX(100%) scale(0.9);
        opacity: 0;
    }
    60% {
        transform: translateX(-10px) scale(1.05);
        opacity: 1;
    }
    80% {
        transform: translateX(5px) scale(0.95);
    }
    100% {
        transform: translateX(0) scale(1);
    }
}

/* Styling the text to improve readability */
/* Adding background with rounded corners to text elements */

.verticalSection.section0 .cardTextActionButton {

    color: #000; /* Black text color */
    padding: 5px 10px; /* Padding around text */
    border-radius: 20px; /* Rounded corners */
    font-weight: bold; /* Bold text */
    text-transform: uppercase; /* Uppercase text */
    font-family: 'Roboto', sans-serif; /* Clean sans-serif font */
    display: inline-block; /* Inline block for padding and border-radius to apply */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3); /* Subtle shadow for better contrast */
    transition: background-color 0.3s ease, color 0.3s ease; /* Smooth transition for hover effect */
}

/* Additional styling for other elements if needed */
.verticalSection.section0 .mediaInfoItem-border {
    background-color: rgba(255, 255, 255, 0.8); /* White background with transparency */
    color: #000; /* Black text color */
    padding: 3px 6px; /* Padding around text */
    border-radius: 15px; /* Rounded corners */
    font-weight: bold; /* Bold text */
    display: inline-block; /* Inline block for padding and border-radius to apply */
    margin-right: 5px; /* Space between text items */
}

/* Optional: Add some spacing between each media info item */
.verticalSection.section0 .media-info {
    margin-bottom: 5px; /* Add spacing between media info items */
}
body > div.view.flex.flex-direction-column.withTabs.page.focuscontainer-x.view-home-home > div.tabContent.tabContent-positioned.flex.flex-grow.is-active.focuscontainer-x > div > div > div.verticalSection.verticalSection-cards.section0.emby-scrollbuttons-scroller > div.sectionTitleContainer.sectionTitleContainer-cards > h2 {
    display: none;
}
.verticalSection.verticalSection-cards.section1.emby-scrollbuttons-scroller {
    margin-top: -8%;
}

/////////////////////////////////////////////////////
/* Keyframes for bounce-in effect */
@keyframes bounceIn {
    0% {
        transform: translateX(100%) scale(0.9);
        opacity: 0;
    }
    60% {
        transform: translateX(-10px) scale(1.05);
        opacity: 1;
    }
    80% {
        transform: translateX(5px) scale(0.95);
    }
    100% {
        transform: translateX(0) scale(1);
    }
}


/* Effects on hover for cards within section0 */
.verticalSection.section0 .card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

/* Hover effect for card scaling and shadow */
.verticalSection.section0 .card:hover {
    transform: scale(1.05); /* Slightly enlarge the card */
}

/* Optional: Add some spacing between cards */
.verticalSection.section0 .cardBox {
    margin-bottom: 10px; /* Add spacing between cards */
}

/* Additional adjustments to ensure everything is well aligned and visible */
.verticalSection.section0 .cardImage {
    border-radius: 5px; /* Add some rounding to the images */
    overflow: hidden; /* Ensure the images don’t overflow */
}

.verticalSection.section0 .cardBox-touchzoom {
    padding: 10px; /* Add padding around the cards */
}

/* Add a small animation delay for each card for staggered effect */
.verticalSection.section0 .card:nth-child(1) {
    animation: fadeIn 0.5s ease-in-out 0.1s forwards;
}

.verticalSection.section0 .card:nth-child(2) {
    animation: fadeIn 0.5s ease-in-out 0.2s forwards;
}

.verticalSection.section0 .card:nth-child(3) {
    animation: fadeIn 0.5s ease-in-out 0.3s forwards;
}

/* Keyframes for fade-in effect */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
/////////////////////////////////////////////////////
/* Card styling to achieve rounded edges and overlay effect */
.verticalSection.section0 .card {
    position: relative; /* Ensure the overlay can be positioned absolutely */
    margin: 0 10px; /* Spacing between cards */
    border-radius: 10px; /* Rounded corners */
    overflow: hidden; /* Clip the overlay within the rounded corners */
    transition: transform 0.3s ease; /* Smooth transition for scaling */
    background-color: rgba(0, 0, 0, 0.5); /* Add a slight dark overlay */
}

.verticalSection.section0 .card img {
    border-radius: 10px; /* Match the rounded corners */
}

/* Text overlay styling */
.verticalSection.section0 .cardText {
    position: absolute; /* Overlay positioning */
    bottom: 0; /* Align to the bottom */
    left: 0;
    right: 0;
    padding: 5px;
    background: rgba(0, 0, 0, 0.6); /* Semi-transparent background */
    color: white; /* White text for contrast */
    font-weight: bold; /* Bold text for readability */
    font-size: 0.9em; /* Slightly larger font size */
    text-align: center; /* Center the text */
    display: flex; /* Flexbox for center alignment */
    align-items: center; /* Center align items vertically */
    justify-content: center; /* Center align items horizontally */
    text-transform: uppercase; /* Uppercase text for consistency */
    border-radius: 0 0 10px 10px; /* Match bottom corners rounding */
}


.carousel {
    width: 100vw; /* Full viewport width for each slide */
    display: flex; /* Use flexbox for easy alignment */
}

.carousel-image-container {
    width: 100vw; /* Each image container takes full viewport width */
    position: relative;
    overflow: hidden;
}

.carousel-image {
    width: 100%;
    height: auto;
    transition: transform 0.5s ease-in-out;
}

/* Custom dot navigation styling for the carousel */
.slick-dots {
    position: absolute;
    bottom: 20px;
    width: 100%;
    display: flex !important;
    justify-content: center;
    padding: 0;
    list-style: none;
    z-index: 2;
}

.slick-dots li {
    width: auto;
    height: auto;
    margin: 0 5px;
}

.slick-dots li button {
    border: none;
    background: transparent;
    font-size: 0;
    line-height: 0;
    cursor: pointer;
    color: transparent;
    outline: none;
}

.slick-dots li button:before {
    font-family: "slick";
    font-size: 12px;
    line-height: 20px;
    position: absolute;
    top: 0;
    left: 0;
    width: 20px;
    height: 20px;
    content: "•";
    color: white;
    opacity: 0.5;
    transition: opacity 0.3s ease;
}

.slick-dots li.slick-active button:before {
    opacity: 1;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

/* General settings for the skin header */
.skinHeader {
    z-index: 10; /* Ensure it's on top */
    display: flex;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    align-items: flex-start;
    padding-top: 1.2em;
    padding-left: env(safe-area-inset-left, 0);
    padding-right: env(safe-area-inset-right, 0);
    background: transparent; /* Transparent background for the header */
}

.sectionTabs {
    text-align: center;
    display: none;
}

.skinHeader-withBackground.headroom-scrolling {
    background: transparent !important;
}

.paper-icon-button-light {
    color: white; /* Keep the white color */
    text-shadow: 1px 1px 2px black, 0 0 1em black; /* Add text shadow */
    padding: 10px;
    border-radius: 5px;
    background-color: rgba(0, 0, 0, 0.3); /* Add a semi-transparent background for better readability */
}

.headerTop-withSectionTabs .headerLeft, .headerTop-withSectionTabs .headerRight {
    width: 20%;
    margin-right: 3%;
}

.pageTitleWithDefaultLogo {
    width: 10.25em !important;
    background-size: cover;
}

.mainDrawer {
    background: transparent !important;
}

.scrollSlider.mainDrawerScrollSlider.scrollSliderY.mainDrawerScrollSlider-autofont {
    background: hsl(0, 0%, calc(11.76% + 3.5%)) !important;
    border-radius: 10px;
}

.navDrawerHeader.flex.flex-direction-row.align-items-center {
    display: none;
}

.mainDrawer.scrollY {
    overflow-y: overlay;
    padding-top: 2.5%;
}

.drawer-open {
    box-shadow: none !important;
}

.carousel-details {
    text-align: center;
}

.mediaInfoItem-border {
    vertical-align: baseline !important;
}

/* Carousel caption styling */
.carousel-caption {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.7);
    padding: 20px;
    border-radius: 5px;
    color: white;
    text-align: center;
    width: 80%;
    opacity: 0; /* Start hidden */
    transform: translateY(20px); /* Start slightly below */
    animation: fadeInUp 1s ease forwards; /* Animate into view */
    animation-delay: 1s; /* Delay the start of the animation */
}

.carousel-caption .carousel-logo {
    margin-bottom: 10px;
}

.carousel-caption .carousel-details,
.carousel-caption .carousel-button {
    opacity: 0; /* Details and button hidden initially */
    animation: fadeIn 1s ease forwards; /* Animate into view */
    animation-delay: 1s; /* Delay the start of the animation */
}

.carousel-caption .carousel-details {
    margin-bottom: 10px;
    font-size: 1em;
    color: #ddd;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
}

.carousel-caption .carousel-details span {
    margin: 0 10px;
    display: flex;
    align-items: center;
}

.carousel-caption .carousel-details i {
    margin-right: 5px;
}

.slick-slide {
    padding-left: 0px !important;
}

.carousel-caption .carousel-button {
    margin-top: 10px;
    background-color: red;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 1.2em;
    text-decoration: none;
    transition: background-color 0.3s;
}

.carousel-caption .carousel-button:hover {
    background-color: orange;
}

.media-info {
    display: flex;
    align-items: center;
    margin: 0 5px;
}

.media-info i {
    margin-right: 5px;
}

/* Hover and Zoom Effects */
.carousel-image-container {
    overflow: hidden;
    position: relative;
}

.carousel-image {
    width: 100%;
    height: auto;
    transition: transform 0.5s ease-in-out;
}

.carousel-image-container:hover .carousel-image {
    transform: scale(1.05);
}

/* Responsive adjustments */
@media screen and (max-width: 768px) {
    .carousel-caption {
        bottom: 30px;
        padding: 15px;
        width: 90%;
    }
}

@media screen and (max-width: 480px) {
    .carousel-caption {
        bottom: 20px;
        padding: 10px;
        width: 95%;
    }

    .carousel-caption .carousel-button {
        padding: 8px 15px;
        font-size: 1em;
    }
}
```
    
