
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
/* General styles to ensure proper display */
body > div.view.flex.flex-direction-column.withTabs.page.focuscontainer-x.view-home-home > div.tabContent.tabContent-positioned.flex.flex-grow.is-active.focuscontainer-x > div > div > div.section2 > div:nth-child(1), 
body > div.view.flex.flex-direction-column.withTabs.page.focuscontainer-x.view-home-home > div.tabContent.tabContent-positioned.flex.flex-grow.is-active.focuscontainer-x > div > div > div.section2 > div:nth-child(2),
body > div.view.flex.flex-direction-column.withTabs.page.focuscontainer-x.view-home-home > div.tabContent.tabContent-positioned.flex.flex-grow.is-active.focuscontainer-x > div > div > div.verticalSection.verticalSection-cards.section0.emby-scrollbuttons-scroller > div.sectionTitleContainer.sectionTitleContainer-cards > h2 {
    display: none; /* Ensure these sections are hidden as intended */
}

.verticalSection.verticalSection-cards.section1.emby-scrollbuttons-scroller {
    margin-top: -8%;
}

/* Media-info styling */
span.media-info {
    margin-right: 5px;
}

/* Carousel container and image styling */
.carousel-container {
    position: relative;
    margin-top: -5.525em; /* Adjust to overlap the header */
    z-index: 1;
    width: 100vw; /* Full viewport width */
    overflow: hidden;
}

.carousel {
    width: 100vw;
    display: flex;
}

.carousel-image-container {
    width: 100vw;
    position: relative;
    overflow: hidden;
    transition: transform 0.5s ease, opacity 0.5s ease; /* Merged transition styles */
}

.carousel-image {
    width: 100%;
    height: auto;
    transition: transform 0.5s ease-in-out;
    position: relative; /* Merged with gradient overlay */
}

.carousel-image:before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7));
    z-index: 1; /* Ensure the overlay is above the image */
}

.carousel-image-container:hover .carousel-image {
    transform: scale(1.05);
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
    animation: fadeInUp 1s ease forwards; /* Animate into view */
    animation-delay: 1s; /* Delay the start of the animation */
}

.carousel-caption .carousel-logo {
    margin-bottom: 10px;
}

.carousel-caption .carousel-details,
.carousel-caption .carousel-button {
    opacity: 0;
    animation: fadeIn 1s ease forwards;
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

/* Vertical Section and card styles */
.verticalSection.section0 {
    display: block; /* Ensure it's visible by default */
    top: -25%;
    left: 33%;
    z-index: 100;
    animation: bounceIn 1s ease-out forwards;
}

.verticalSection.section0 .card {
    position: relative;
    margin: 0 10px;
    border-radius: 10px;
    overflow: hidden;
    transition: transform 0.3s ease;
    background-color: rgba(0, 0, 0, 0.5);
}

.verticalSection.section0 .card img {
    border-radius: 10px;
}

.verticalSection.section0 .card:hover {
    transform: scale(1.05);
}

/* Card text overlay styling */
.verticalSection.section0 .cardText {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 5px;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    font-weight: bold;
    font-size: 0.9em;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    border-radius: 0 0 10px 10px;
}

.verticalSection.section0 .cardTextActionButton,
.verticalSection.section0 .mediaInfoItem-border {
    color: #000;
    padding: 5px 10px;
    border-radius: 20px;
    font-weight: bold;
    text-transform: uppercase;
    font-family: 'Roboto', sans-serif;
    display: inline-block;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    transition: background-color 0.3s ease, color 0.3s ease;
    margin-right: 5px; /* Space between media info items */
}

/* Optional: Add some spacing between cards */
.verticalSection.section0 .cardBox {
    margin-bottom: 10px;
    padding: 10px;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.3), 0 6px 10px rgba(0, 0, 0, 0.2);
}

.verticalSection.section0 .media-info {
    margin-bottom: 5px;
    margin-right: 5px; /* Ensures consistent spacing */
}

/* Smooth transition for carousel slides */
.carousel-image-container {
    transition: transform 0.5s ease, opacity 0.5s ease; /* Merged transition styles */
}

/* Hover and Zoom Effects */
.carousel-image-container {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5); /* Added shadow effect */
}

.carousel-image:hover {
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.7); /* Glow effect on hover */
}

/* Custom navigation buttons */
.carousel-nav-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(255, 255, 255, 0.8);
    border: none;
    padding: 10px;
    cursor: pointer;
    z-index: 2;
}

.carousel-nav-button.left {
    left: 10px;
}

.carousel-nav-button.right {
    right: 10px;
}

.carousel-nav-button:hover {
    background-color: rgba(255, 255, 255, 1);
}

/* Animated captions */
.carousel-caption {
    animation: slideInUp 0.5s ease-out forwards;
}

@keyframes slideInUp {
    from {
        transform: translateY(20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

/* Parallax effect */
.carousel-image {
    background-attachment: fixed;
    background-size: cover;
}

/* Responsive adjustments */
@media screen and (max-width: 1920px) {
    .carousel-tagline,
    .verticalSection.section0 {
        display: none;
    }

    .verticalSection.verticalSection-cards.section1.emby-scrollbuttons-scroller {
        margin-top: -2% !important;
    }
}

@media screen and (max-width: 1080px) {
    .carousel,
    .verticalSection.section0 {
        display: none;
    }
}

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

/* 4K screen adjustments */
@media screen and (min-width: 3840px) {
    .verticalSection.section0 {
        left: 46%;
        top: -20%;
    }

    .carousel .carousel-image {
        max-height: 1800px;
    }

    .verticalSection.verticalSection-cards.section1.emby-scrollbuttons-scroller {
        margin-top: -6% !important;
    }

    .carousel .carousel-caption {
        bottom: unset !important;
        left: 20px;
        top: 70%;
        width: 25%;
        color: white;
        text-align: left;
        text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
        background: rgba(0, 0, 0, 0.5);
        padding: 20px;
        border-radius: 5px;
    }
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

/* Keyframes for fade-in effect */
@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

/* Keyframes for fade-in-up effect */
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

/* Ensure the carousel and its elements use the full width */
@media not all and (min-width: 120em) {
    .withHeaderTabs:not(.layout-tv):root {
        --header-height: 4em;
    }
}

/* Additional styles for header and icons */
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

/* Ensure padding-left is reset to avoid conflicts */
.slick-slide {
    padding-left: 0px !important;
}

```
    
