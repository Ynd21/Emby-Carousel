
![Logo](https://i.imgur.com/VhsMN01.jpeg)
![Demo](https://imgur.com/lgU4z6h)

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
.skinHeader {
    /* This will ensure it is on top of the main body */
    z-index: 10; /* Increase the z-index to ensure it's above other elements */
    display: -webkit-flex;
    display: flex;
    position: absolute; /* Change to absolute to allow overlapping */
    top: 0;
    left: 0;
    right: 0;
    inset-inline-start: 0;
    inset-inline-end: 0;
    box-sizing: border-box;
    height: var(--header-height);
    -webkit-align-items: flex-start;
    align-items: flex-start;
    contain: strict;
    padding-top: 1.2em;
    padding-left: 0;
    padding-left: env(safe-area-inset-left, 0);
    padding-right: 0;
    padding-right: env(safe-area-inset-right, 0);
    -webkit-align-content: flex-start;
    align-content: flex-start;
    -webkit-flex-wrap: wrap;
    flex-wrap: wrap;
    background: transparent; /* Set background to transparent */
}

.carousel-container {
    position: relative;
    margin-top: -5.525em; /* Adjust this value as needed to overlap the header */
    z-index: 1; /* Ensure it's below the header */
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
}
.pageTitleWithDefaultLogo {
    background-size: cover;
}
.mainDrawer {
    background: transparent !important;
}
.scrollSlider.mainDrawerScrollSlider.scrollSliderY.mainDrawerScrollSlider-autofont {
	background: hsl(0, 0%,calc(11.76% + 3.5%)) !important;
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
```
    
