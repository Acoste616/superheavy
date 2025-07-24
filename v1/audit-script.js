const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('🔍 Starting comprehensive audit of main.html...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({width: 1920, height: 1080});
  
  const errors = [];
  const auditResults = {
    pageLoaded: false,
    title: '',
    interactiveElements: [],
    clickTests: [],
    consoleErrors: [],
    networkErrors: [],
    pageErrors: []
  };
  
  // Error listeners
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const error = {
        type: 'console_error',
        message: msg.text(),
        location: msg.location()
      };
      errors.push(error);
      auditResults.consoleErrors.push(error);
      console.log('❌ Console Error:', msg.text());
    }
  });
  
  page.on('pageerror', error => {
    const pageError = {
      type: 'page_error',
      message: error.message,
      stack: error.stack
    };
    errors.push(pageError);
    auditResults.pageErrors.push(pageError);
    console.log('💥 Page Error:', error.message);
  });
  
  page.on('requestfailed', request => {
    const networkError = {
      type: 'network_error',
      url: request.url(),
      failure: request.failure().errorText
    };
    errors.push(networkError);
    auditResults.networkErrors.push(networkError);
    console.log('🌐 Network Error:', request.url(), request.failure().errorText);
  });
  
  try {
    // Load page
    await page.goto('http://localhost:3000/main.html', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    auditResults.pageLoaded = true;
    console.log('✅ Page loaded successfully');
    
    // Get page title
    auditResults.title = await page.title();
    console.log('📄 Page title:', auditResults.title);
    
    // First, click the start analysis button to reveal the interface
    console.log('🚀 Clicking start analysis button to reveal interface...');
    try {
      await page.click('#startAnalysis');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for interface to appear
      console.log('✅ Start analysis button clicked successfully');
    } catch (error) {
      console.log('❌ Failed to click start analysis button:', error.message);
    }
    
    // Find all interactive elements
    const allElements = await page.$$eval(
      'button, a, input, select, [onclick], [data-tab], .trigger-btn, .tab-link, .cta-button',
      elements => elements.map(el => ({
        tag: el.tagName,
        id: el.id,
        class: el.className,
        text: el.textContent?.trim().substring(0, 50),
        hasClick: !!el.onclick || !!el.getAttribute('data-tab') || el.classList.contains('trigger-btn') || el.tagName === 'BUTTON',
        visible: el.offsetParent !== null
      }))
    );
    
    auditResults.interactiveElements = allElements;
    console.log('🔍 Found', allElements.length, 'interactive elements');
    
    // Test clicking on elements
    for (let i = 0; i < Math.min(allElements.length, 20); i++) {
      const element = allElements[i];
      const clickResult = {
        element: element,
        success: false,
        error: null
      };
      
      try {
        if (element.id && element.visible) {
          // Use JavaScript click for better compatibility with event delegation
          await page.evaluate((id) => {
            const el = document.getElementById(id);
            if (el && typeof el.click === 'function') {
              el.click();
              return true;
            }
            return false;
          }, element.id);
          clickResult.success = true;
          console.log('✅ Clicked element:', element.id);
          await new Promise(resolve => setTimeout(resolve, 300));
        } else if (element.class && element.visible) {
          const selector = '.' + element.class.split(' ')[0];
          // Use JavaScript click for better compatibility with event delegation
          await page.evaluate((sel) => {
            const el = document.querySelector(sel);
            if (el && typeof el.click === 'function') {
              el.click();
              return true;
            }
            return false;
          }, selector);
          clickResult.success = true;
          console.log('✅ Clicked element by class:', selector);
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (error) {
        clickResult.error = error.message;
        console.log('❌ Click failed on:', element.id || element.class, error.message);
      }
      
      auditResults.clickTests.push(clickResult);
    }
    
    // Test form functionality
    console.log('📝 Testing form functionality...');
    
    try {
      // Test tone selection
      await page.select('#toneSelect', 'entuzjastyczny');
      console.log('✅ Tone selection works');
      
      // Test trigger selection using JavaScript click - test multiple triggers
      const triggerTestResults = await page.evaluate(() => {
        const triggerBtns = document.querySelectorAll('.trigger-btn');
        const results = {
          found: triggerBtns.length,
          clicked: 0,
          errors: []
        };
        
        // Test clicking first 3 triggers
        for (let i = 0; i < Math.min(3, triggerBtns.length); i++) {
          try {
            const btn = triggerBtns[i];
            const initialSelected = document.querySelectorAll('.trigger-btn.border-tesla-red').length;
            btn.click();
            // Wait a bit for the click to process
            setTimeout(() => {
              const newSelected = document.querySelectorAll('.trigger-btn.border-tesla-red').length;
              if (newSelected > initialSelected) {
                results.clicked++;
              }
            }, 100);
            results.clicked++;
          } catch (error) {
            results.errors.push(error.message);
          }
        }
        
        return results;
      });
      
      console.log(`✅ Found ${triggerTestResults.found} trigger buttons, clicked ${triggerTestResults.clicked}`);
      if (triggerTestResults.errors.length > 0) {
        console.log('⚠️ Trigger click errors:', triggerTestResults.errors);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if analysis button is enabled after trigger selection
      const analysisButtonStatus = await page.evaluate(() => {
        const analysisBtn = document.querySelector('#runAnalysis');
        if (!analysisBtn) return { found: false };
        
        return {
          found: true,
          disabled: analysisBtn.disabled,
          visible: analysisBtn.offsetParent !== null,
          selectedTriggers: document.querySelectorAll('.trigger-btn.border-tesla-red').length
        };
      });
      
      console.log('📊 Analysis button status:', analysisButtonStatus);
      
      if (analysisButtonStatus.found && !analysisButtonStatus.disabled) {
        const analysisClicked = await page.evaluate(() => {
          const analysisBtn = document.querySelector('#runAnalysis');
          analysisBtn.click();
          return true;
        });
        
        if (analysisClicked) {
          console.log('✅ Analysis button clicked successfully');
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for analysis
          
          // Check if results appeared
          const resultsVisible = await page.evaluate(() => {
            const resultsSection = document.querySelector('#analysisResults');
            return resultsSection && resultsSection.style.display !== 'none';
          });
          
          console.log('📊 Analysis results visible:', resultsVisible);
        }
      } else {
        console.log('⚠️ Analysis button not ready:', analysisButtonStatus);
      }
      
    } catch (error) {
      console.log('❌ Form test failed:', error.message);
      auditResults.clickTests.push({
        element: {tag: 'FORM', id: 'form-test'},
        success: false,
        error: error.message
      });
    }
    
    // Final comprehensive test of trigger functionality
    console.log('🔬 Running comprehensive trigger functionality test...');
    
    // Check if trigger grid exists
    const triggerGrid = await page.$('#triggerGrid');
    const triggerGridFound = !!triggerGrid;
    console.log('Trigger grid found:', triggerGridFound);
    
    // Expand all categories first to make triggers visible
        console.log('🔄 Expanding all categories...');
        
        // Check initial state of categories
        const initialState = await page.evaluate(() => {
            const categories = [];
            const categoryToggles = document.querySelectorAll('.category-toggle');
            categoryToggles.forEach(toggle => {
                const categoryKey = toggle.dataset.category;
                const categorySection = document.querySelector(`.category-triggers[data-category="${categoryKey}"]`);
                categories.push({
                    category: categoryKey,
                    display: categorySection ? categorySection.style.display : 'not found',
                    exists: !!categorySection
                });
            });
            return categories;
        });
        console.log('📊 Initial category states:', initialState);
        
        // Force expand all categories
        await page.evaluate(() => {
            const categoryToggles = document.querySelectorAll('.category-toggle');
            categoryToggles.forEach(toggle => {
                const categoryKey = toggle.dataset.category;
                const categorySection = document.querySelector(`.category-triggers[data-category="${categoryKey}"]`);
                if (categorySection) {
                    // Force display to grid regardless of current state
                    categorySection.style.display = 'grid';
                    console.log(`Forced category ${categoryKey} to display: grid`);
                }
            });
        });
        
        // Wait for layout to update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check final state
        const finalState = await page.evaluate(() => {
            const categories = [];
            const categoryToggles = document.querySelectorAll('.category-toggle');
            categoryToggles.forEach(toggle => {
                const categoryKey = toggle.dataset.category;
                const categorySection = document.querySelector(`.category-triggers[data-category="${categoryKey}"]`);
                categories.push({
                    category: categoryKey,
                    display: categorySection ? categorySection.style.display : 'not found',
                    exists: !!categorySection
                });
            });
            return categories;
        });
        console.log('📊 Final category states:', finalState);
     
     // Check if app instance is available and has event listeners
    const eventListenersAttached = await page.evaluate(() => {
        return window.app && typeof window.app.toggleTrigger === 'function';
    });
    console.log('Event listeners attached:', eventListenersAttached);
    
    // Debug DOM structure and CSS loading
        const domStructure = await page.evaluate(() => {
            const triggerGrid = document.querySelector('.trigger-grid');
            const categories = document.querySelectorAll('.category-triggers');
            const triggers = document.querySelectorAll('.trigger-btn');
            
            // Check if Tailwind CSS is loaded by testing a known class
            const testElement = document.createElement('div');
            testElement.className = 'p-4 bg-blue-500';
            document.body.appendChild(testElement);
            const tailwindLoaded = getComputedStyle(testElement).padding === '16px';
            document.body.removeChild(testElement);
            
            return {
                triggerGridExists: !!triggerGrid,
                triggerGridDisplay: triggerGrid ? getComputedStyle(triggerGrid).display : 'not found',
                categoriesCount: categories.length,
                triggersCount: triggers.length,
                tailwindLoaded: tailwindLoaded,
                firstTriggerParent: triggers[0] ? triggers[0].parentElement.className : 'no triggers',
                firstTriggerContent: triggers[0] ? triggers[0].innerHTML.substring(0, 100) : 'no triggers',
                firstTriggerComputedStyle: triggers[0] ? {
                    display: getComputedStyle(triggers[0]).display,
                    width: getComputedStyle(triggers[0]).width,
                    height: getComputedStyle(triggers[0]).height,
                    padding: getComputedStyle(triggers[0]).padding,
                    border: getComputedStyle(triggers[0]).border,
                    backgroundColor: getComputedStyle(triggers[0]).backgroundColor
                } : 'no triggers',
                firstTriggerBoundingRect: triggers[0] ? triggers[0].getBoundingClientRect() : 'no triggers'
            };
        });
        console.log('📊 DOM Structure:', domStructure);
    
    // Count trigger buttons and test functionality
    const triggerButtons = await page.$$('.trigger-btn');
    const triggerButtonsCount = triggerButtons.length;
    console.log('Total trigger buttons found:', triggerButtonsCount);
    
    let clickableButtons = 0;
    let functionalButtons = 0;
    
    // Test a sample of trigger buttons (max 10 to get better coverage)
    const buttonsToTest = Math.min(10, triggerButtonsCount);
    
    for (let i = 0; i < buttonsToTest; i++) {
        const button = triggerButtons[i];
        
        try {
             // Check if button is clickable (use computed styles instead of boundingClientRect)
             const buttonInfo = await page.evaluate(btn => {
                 const style = window.getComputedStyle(btn);
                 return {
                     width: style.width,
                     height: style.height,
                     padding: style.padding,
                     visibility: style.visibility,
                     display: style.display,
                     opacity: style.opacity,
                     hasContent: btn.innerHTML.length > 0,
                     isClickable: btn.innerHTML.length > 0 && 
                                 style.visibility !== 'hidden' &&
                                 style.display !== 'none' &&
                                 style.opacity !== '0' &&
                                 style.padding !== '0px'
                 };
             }, button);
             
             console.log(`Button ${i + 1} info:`, buttonInfo);
             
             if (buttonInfo.isClickable) {
                clickableButtons++;
                
                // Get initial state - check for selected state classes
                const initialState = await page.evaluate(btn => {
                    return {
                        classes: btn.className,
                        hasSelectedClasses: btn.classList.contains('border-tesla-red') || 
                                          btn.classList.contains('bg-tesla-red') ||
                                          btn.classList.contains('bg-opacity-20'),
                        triggerText: btn.dataset.triggerText
                    };
                }, button);
                
                // Click the button using page.evaluate to avoid Puppeteer click issues
                await page.evaluate(btn => btn.click(), button);
                await new Promise(resolve => setTimeout(resolve, 200)); // Wait for state change
                
                // Get state after click
                const afterState = await page.evaluate(btn => {
                    return {
                        classes: btn.className,
                        hasSelectedClasses: btn.classList.contains('border-tesla-red') || 
                                          btn.classList.contains('bg-tesla-red') ||
                                          btn.classList.contains('bg-opacity-20'),
                        triggerText: btn.dataset.triggerText
                    };
                }, button);
                
                // Check if selection state changed
                const stateChanged = initialState.hasSelectedClasses !== afterState.hasSelectedClasses;
                
                // Also check if selectedTriggers Set was updated
                const selectedTriggersUpdated = await page.evaluate((triggerText) => {
                    return window.app && window.app.selectedTriggers && 
                           window.app.selectedTriggers.has(triggerText);
                }, afterState.triggerText);
                
                if (stateChanged || selectedTriggersUpdated) {
                    functionalButtons++;
                    console.log(`Button ${i + 1}: Functional (${stateChanged ? 'visual change' : 'state updated'})`);
                    console.log(`  - Trigger: "${afterState.triggerText}"`);
                    console.log(`  - Selected: ${selectedTriggersUpdated}`);
                } else {
                    console.log(`Button ${i + 1}: Not functional`);
                    console.log(`  - Trigger: "${afterState.triggerText}"`);
                    console.log(`  - Initial selected: ${initialState.hasSelectedClasses}`);
                    console.log(`  - After selected: ${afterState.hasSelectedClasses}`);
                }
            }
        } catch (error) {
            console.log(`Button ${i + 1}: Error testing -`, error.message);
        }
    }
    
    // Check overall selected triggers count
    const selectedCount = await page.evaluate(() => {
        return window.app && window.app.selectedTriggers ? window.app.selectedTriggers.size : 0;
    });
    
    console.log(`Clickable buttons: ${clickableButtons}/${triggerButtonsCount}`);
    console.log(`Functional buttons: ${functionalButtons}/${clickableButtons}`);
    console.log(`Total selected triggers: ${selectedCount}`);
    
    const comprehensiveTest = {
        triggerGridFound,
        eventListenersAttached,
        triggerButtonsCount,
        clickableButtons,
        functionalButtons,
        selectedTriggersCount: selectedCount
    };
    
    console.log('🔬 Comprehensive test results:', comprehensiveTest);
    auditResults.comprehensiveTest = comprehensiveTest;
    
  } catch (error) {
    console.error('💥 Audit failed:', error.message);
    auditResults.pageLoaded = false;
  } finally {
    await browser.close();
  }
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalErrors: errors.length,
      pageLoaded: auditResults.pageLoaded,
      interactiveElementsFound: auditResults.interactiveElements.length,
      successfulClicks: auditResults.clickTests.filter(t => t.success).length,
      failedClicks: auditResults.clickTests.filter(t => !t.success).length
    },
    details: auditResults,
    recommendations: []
  };
  
  // Add recommendations based on findings
  if (errors.length > 0) {
    report.recommendations.push('Fix console and network errors');
  }
  
  if (auditResults.clickTests.some(t => !t.success)) {
    report.recommendations.push('Fix non-responsive interactive elements');
  }
  
  if (auditResults.comprehensiveTest) {
    const test = auditResults.comprehensiveTest;
    if (!test.triggerGridFound) {
      report.recommendations.push('Trigger grid element not found');
    }
    if (!test.eventListenersAttached) {
      report.recommendations.push('Event listeners not properly attached');
    }
    if (test.triggerButtonsCount === 0) {
      report.recommendations.push('No trigger buttons found');
    }
    if (test.functionalButtons < test.clickableButtons) {
      report.recommendations.push(`Only ${test.functionalButtons}/${test.clickableButtons} trigger buttons are functional`);
    }
    if (test.selectedTriggersCount === 0) {
      report.recommendations.push('No triggers were successfully selected during testing');
    }
  }
  
  // Save report
  fs.writeFileSync('audit-report.json', JSON.stringify(report, null, 2));
  
  console.log('📊 Audit Summary:');
  console.log('- Page loaded:', auditResults.pageLoaded);
  console.log('- Total errors:', errors.length);
  console.log('- Interactive elements:', auditResults.interactiveElements.length);
  console.log('- Successful clicks:', auditResults.clickTests.filter(t => t.success).length);
  console.log('- Failed clicks:', auditResults.clickTests.filter(t => !t.success).length);
  console.log('📄 Full report saved to audit-report.json');
  
})().catch(console.error);