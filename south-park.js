const { firefox } = require('playwright');
const { execSync } = require('child_process');

// Get season and episode from command-line arguments
const args = process.argv[2]; // "s1e2"
const seasonEpisode = args ? args.toLowerCase().match(/^s(\d+)e(\d+)$/) : null;

if (!seasonEpisode) {
  console.error("Invalid format. Use: node south-park.js s1e2");
  process.exit(1);
}

const season = parseInt(seasonEpisode[1]);
const episode = parseInt(seasonEpisode[2]);

(async () => {
  let browser;

  try {
    // Launch Firefox in non-headless mode (for visibility)
    browser = await firefox.launch({ headless: false });

    // Create a browser context
    const context = await browser.newContext({
      args: ['--browser.bookmarks.showToolbar=true']
    });

    // Create the initial page
    const page = await context.newPage();

    // Set up an event listener to close any new page that is created
    context.on('page', async (newPage) => {
      console.log('New page opened, closing it...');
      await newPage.close();
    });

    // Construct the episode URL dynamically
    const episodeUrl = `https://iwatchsouthpark.com/episode/south-park-${season}x${episode}/`;

    // Navigate to the URL with a timeout
    console.log(`Navigating to: ${episodeUrl}`);
    const response = await page.goto(episodeUrl, { timeout: 30000 }); // 30 seconds timeout

    // Check if the page loaded successfully
    if (!response || response.status() !== 200) {
      throw new Error('Failed to load the episode page');
    }

    console.log(`Page loaded successfully with status: ${response.status()}`);
    
    // Simulate multiple clicks bypass ads
    await page.mouse.click(300, 400);
    await page.waitForTimeout(500);
    await page.mouse.click(300, 400);
    await page.waitForTimeout(500);
    await page.mouse.click(300, 400);
    await page.waitForTimeout(500);

    // Run the Python script using the Python interpreter (use python3 if necessary)
    //NEED TO press CTRL+SHIFT+] in browser window for PictureInPicture mode !!!!!!!!!! < some better soliotion needed
    try {
      const output = execSync('python3 pip.py');
      console.log('Python script output:', output.toString());
    } catch (error) {
      console.error('An error occurred while running the Python script:', error.message);
    }

    // Wait and log the page title
    await page.waitForTimeout(500);
    const title = await page.title();
    console.log('Current Page Title:', title);

    //NEED TO HIDE/MINIMIZE BROWSER WINDOW !!!!!!!!!! < some better soliotion needed
    //await page.setViewportSize({ width: 1, height: 1 });

  } catch (error) {
    console.error('An error occurred:', error.message);
  } 
  

})();
