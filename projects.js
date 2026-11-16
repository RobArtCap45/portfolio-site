// Robert Capron — project content, shared by the main site (script.js) and /v2/.
// Each project: title, cat, img (poster), optional fit / bg / tag / cover, summary (one line for
// the skim column), facts ([label, text] rows), and sections. Each section: title, optional take
// (one bold takeaway line), body (paragraphs), items ([label, text] rows), images, cols, layout.
// Images are a file { src, caption }, a video { video, poster, caption }, or a placeholder { ph, ratio }.
// Placeholders are hidden from visitors; open the site with ?draft=1 to see what is left to fill.
window.PROJECTS = [
  {
    title: 'Dimensional Etch', cat: 'Interactive — Physical computing', img: 'etch/controller-angled.webp',
    cover: { video: 'etch/sketch-on-screen.mp4', poster: 'etch/sketch-on-screen.jpg', w: 1280, h: 720, caption: 'The controller driving the sketch on the laptop.' },
    summary: "A drawing toy played with three knobs. You climb a towering frame of woven square tubes, your line fills them with liquid in your colour, and everyone in the room plays an instrument in one orchestra.",
    facts: [
      ['Course', 'Interactive 4 (NMDE 404), RIT — Prof. Mike Minerva'],
      ['When', 'Fall 2026, presented at critique on October 5'],
      ['Tools', 'HTML, CSS and JavaScript (Canvas, WebGL, Web Audio), Arduino Leonardo, ESP32, Python, AI-assisted coding'],
    ],
    sections: [
      {
        title: 'Brief',
        body: ["Start from a 16px square that moves with the arrow keys. Grow it into a dimensional etch-a-sketch with an orbit mode, then build a real controller: an Arduino, three encoders and a button."],
      },
      {
        title: 'From a Square to a Shape',
        take: "A moving square became a wire sphere, a cube, then six woven frames. One louder direction was cut so the drawing stayed readable.",
        body: [
          "It started with the class prompt: a square that moves with the arrow keys. That became a wire sphere, then a cube, then six square frames woven through each other, with 24 cells along every edge for the pen to travel.",
          "Along the way I built a version called Controlled Chaos, where the more you drew, the more the clean wireframe broke apart into a collage of chrome, stickers and arrows. It was fun, but the drawing got lost in it, so I went back to clean wireframes and put the energy into the liquid and the sound.",
        ],
        cols: 2,
        images: [
          { src: 'etch/process-1-etch2.jpg', w: 1400, h: 875, caption: 'A wire sphere, with the line drawn on its surface.' },
          { src: 'etch/process-2-tubes.jpg', w: 1400, h: 875, caption: 'A cube inside a cube.' },
          { src: 'etch/process-3-chaos-calm.jpg', w: 1400, h: 875, caption: 'Six woven frames, early in Controlled Chaos.' },
          { src: 'etch/process-4-chaos-full.webp', w: 1400, h: 875, caption: 'Controlled Chaos at full entropy. I cut this direction.' },
        ],
      },
      {
        title: 'Drawing on the Frame',
        take: "The pen never leaves the structure, so the drawing reads as part of the shape.",
        body: ["The pen always stays on the structure, so the drawing reads as part of the shape. You go around a frame's square as many times as you like, and press a knob to jump to the closest line on another frame. Each person draws with a brush."],
        items: [
          ['Knob 1', 'Along the tube. Press to jump to another line; hold for the next brush.'],
          ['Knob 2', 'Around the tube. Press to orbit the camera; hold to clear.'],
          ['Knob 3', 'Out from the tube. Press to confirm.'],
          ['Switch', 'Opens the menu: change colour, new instrument, knob speed.'],
        ],
        cols: 3,
        images: [
          { src: 'etch/brush-ribbon.jpg', w: 924, h: 648, caption: 'Ribbon' },
          { src: 'etch/brush-blueprint.jpg', w: 924, h: 648, caption: 'Blueprint' },
          { src: 'etch/brush-pixel.jpg', w: 924, h: 648, caption: 'Pixel' },
          { src: 'etch/brush-notation.jpg', w: 924, h: 648, caption: 'Notation' },
          { src: 'etch/brush-wave.jpg', w: 924, h: 648, caption: 'Wave: a waveform of the sound that was playing as you drew.' },
        ],
      },
      {
        title: 'Liquid',
        take: "Drawing pours liquid in your colour. It runs downhill and mixes with everyone else's.",
        body: [
          "Drawing pours liquid into the tube you're on, in the colour you chose when you came in. It runs downhill inside each frame, fills it box by box, and mixes with everyone else's colours by volume. It's rendered as metaballs on the GPU, so it reads like one glossy liquid rather than dots.",
        ],
      },
      {
        title: 'An Orchestra',
        take: "Three rules keep 20 or more people sounding good together: one chord progression, one shared beat, and a conductor that thins the notes.",
        body: [
          "Every person is dealt an instrument, like a seat in an orchestra, from whichever section the room needs most: foundation, harmony, melody or colour. Climbing higher on the shape plays higher notes.",
          "Three rules keep 20 or more people sounding good together. Everyone plays inside one slow chord progression, so no note clashes. Everyone lands on a shared beat. And a conductor lets only a few notes through per beat, so the room gets sparser and softer as it fills. Your own instrument stays just a little louder than everyone else's.",
        ],
        items: [
          ['Harmony', 'D major: Dmaj9, Bm11, Gmaj9, A6sus, a chord every two bars'],
          ['Pulse', '76 bpm. Other people on eighth notes, you on sixteenths'],
          ['Sections', 'Double bass and timpani to glockenspiel and music box, 24 instruments in all'],
        ],
      },
      {
        title: 'Together',
        take: "The whole class draws on one shape at once, each person with a colour, a name tag and an instrument.",
        body: ["The etch is built to the class's multiplayer spec, so the whole class can draw on one shape at once. Each person picks a liquid colour on the way in, carries a name tag, and is heard in their own instrument. With 20 people in the room it stays smooth and readable."],
        images: [
          { src: 'etch/final-class.webp', w: 1600, h: 1000, caption: 'Twelve people drawing on the frame at once, every brush and colour mixing.' },
          { video: 'etch/lab-session-drawing.mp4', poster: 'etch/lab-session-drawing.jpg', w: 1280, h: 720, caption: 'Drawing in the lab.' },
        ],
      },
      {
        title: 'The Controller',
        take: "An Arduino Leonardo in a Doritos and Lay's box: three encoders, a switch, cardboard and tape.",
        body: ["An Arduino Leonardo inside a Doritos and Lay's box. Three rotary encoders and a toggle switch on top, and the wiring on a breadboard inside, all held together with cardboard and tape."],
        items: [
          ['Board', 'Arduino Leonardo'],
          ['Inputs', 'Three KY-040 rotary encoders and a toggle switch'],
          ['Modes', 'Drives the etch through a small Python bridge, or works as a USB keyboard on the class site'],
          ['Wiring', 'Copes with any pins, button type or knob direction; mistakes are caught when it compiles'],
        ],
        cols: 2,
        images: [
          { src: 'etch/controller-angled.webp', w: 1200, h: 1600, caption: 'The controller: three round screens, three knobs and a switch.' },
          { src: 'etch/controller-inside.webp', w: 1200, h: 1600, caption: 'Opened up: the Leonardo, encoders and breadboard.' },
          { video: 'etch/handheld-drawing.mp4', poster: 'etch/handheld-drawing.jpg', w: 1280, h: 720, caption: 'Drawing with the controller in hand.' },
          { src: 'etch/controller-laptop.webp', w: 1600, h: 1200, caption: 'Choosing a liquid colour with the knobs.' },
        ],
      },
      {
        title: 'Round Screens',
        take: "Three round displays on the controller let you follow your drawing without looking up.",
        body: ["An ESP32 drives three 1.28-inch round displays on the controller, so you can follow your drawing without looking up. It draws everything itself from small updates the page sends, about fifteen times a second."],
        items: [
          ['Screen 1', 'The whole shape from above, with everyone as a dot'],
          ['Screen 2', 'A pen camera, looking up the tube you are on'],
          ['Screen 3', 'Your brush, the three knobs as dials, and a glass of your liquid that fills as the shape does'],
        ],
        images: [
          { video: 'etch/round-displays-closeup.mp4', poster: 'etch/round-displays-closeup.jpg', w: 1280, h: 720, caption: 'The three round screens following the drawing.' },
          { src: 'etch/wiring-screens.png', w: 1154, h: 726, caption: 'Wiring: the screens share four signal wires; each has its own CS pin.' },
        ],
      },
      {
        title: 'Final', layout: 'media-first',
        body: ["The finished etch, drawn live with the controller."],
        images: [
          { video: 'etch/walkthrough.mp4', poster: 'etch/walkthrough.jpg', w: 960, h: 592, caption: 'A full drawing session on critique day, sped up three times.' },
          { video: 'etch/class-drawing.mp4', poster: 'etch/class-drawing.jpg', w: 1280, h: 716, caption: 'A simulated class of twenty drawing in Notation, with the liquid filling the frames.' },
        ],
      },
      {
        title: 'Reflection',
        take: "A simple prompt goes a long way when you keep asking what the next layer should be.",
        body: [
          "This project taught me how far a simple prompt can go when I keep asking what the next layer should be: from a moving square to a shared space where a class draws, pours and plays music together.",
          "It was also my first time taking a project from code to wires to cardboard. Debugging went both ways, from a screen that stayed blank because of one loose wire to knobs that turned the wrong way because of how they were read. Building the controller so it works with anyone's wiring taught me to design for the people who would use it, not just for my own setup.",
        ],
      },
    ],
  },
  {
    title: 'Pizza Wizard', cat: 'UX/UI — Ordering kiosk', img: 'pw-logo.webp', fit: 'contain',
    bg: 'pw-bg.webp',   // brand pattern behind the logo in the case study
    summary: "A self-serve ordering kiosk for a pizza brand, from a usability audit of a real kiosk through wireframes and a style guide to the final screens.",
    facts: [
      ['Length', 'Four months, a new step each week'],
      ['Steps', 'Research, wireframes and work flows, style guide, grid layout, compositions'],
      ['Method', "Nielsen's 10 usability heuristics"],
    ],
    // Case study, top to bottom. Each section: title, body (paragraphs), optional
    // items (label + text rows), optional images. Images are either a file —
    // { src: 'file.png', caption: '…' } — or a placeholder box — { ph: 'what goes here' }.
    // Add `ratio: '16/9'` to a placeholder to change its shape; `cols: 2` puts a section's images side by side.
    sections: [
      {
        title: 'The Brief',
        body: ["Design a self-serve ordering kiosk for a brand."],
        images: [{ src: 'pizza-wizard/brief-splash.jpg?v=2', w: 1496, h: 1088, caption: 'The kiosk’s splash screen: “Mmmm Pizza!”' }],
      },
      {
        title: 'Brainstorm', layout: 'split',
        take: "Before drawing a screen, I walked a real kiosk's whole order flow and scored it against Nielsen's 10 heuristics.",
        body: ["I started with research at a real, installed kiosk, walking the entire order-to-checkout flow and scoring it against Nielsen's 10 usability heuristics to see what held up and what didn't. That audit set the baseline before a single screen was drawn: what actually makes a touchscreen ordering flow fast, versus what just looks fast."],
        images: [{ src: 'pizza-wizard/brainstorm-score-scale.png', w: 890, h: 1040, caption: 'Each of Nielsen’s 10 heuristics scored 0 to 4.' }],
      },
      {
        title: 'Timeline',
        body: ["A four-month project, with a new step each week, from competitive research through to animated compositions."],
        items: [
          ['01', 'Research'],
          ['02', 'Wireframes and work flows'],
          ['03', 'Style guide'],
          ['04', 'Grid layout'],
          ['05', 'Compositions'],
        ],
      },
      {
        title: 'Scope',
        body: ["Everything needed to make this kiosk work."],
        items: [
          ['Hardware', "I simulated what the kiosk would look like and where it would be placed, based on customer flow."],
          ['Content', "I used Pizza Wizard's current menu and items, and added restrictions and limits on orders."],
          ['Functionality', "I researched the user flow, including accessibility, item removal, and error prevention."],
        ],
        cols: 2,
        images: [
          { src: 'pizza-wizard/scope-console-guide.jpg', w: 1290, h: 1090, caption: 'Console guide: a 22" screen on the counter, next to the cashier and pizza display.' },
          { src: 'pizza-wizard/scope-3d-render.jpg', w: 1190, h: 1160, caption: '3D render of the kiosks in the restaurant.' },
        ],
      },
      {
        title: 'Workflow',
        body: ["I mapped out the user's journey through the kiosk."],
        images: [
          { src: 'pizza-wizard/workflow-main.webp', w: 2000, h: 781, caption: 'Main flow.' },
          { src: 'pizza-wizard/workflow-checkout.webp', w: 2000, h: 675, caption: 'Checkout flow.' },
        ],
      },
      {
        title: 'Mockups',
        items: [
          ['Physical', "I modeled every element to scale to get a better sense of sizing."],
          ['Virtual', "I made a virtual mockup to see how the kiosk might look in the restaurant."],
        ],
        cols: 2,
        images: [
          { src: 'pizza-wizard/mockup-physical.jpg', w: 1600, h: 896, caption: 'Physical mockup: type, buttons and keypad printed to scale.' },
          { src: 'pizza-wizard/mockup-3d-render.jpg', w: 1213, h: 1195, caption: 'Virtual mockup in the restaurant.' },
        ],
      },
      {
        title: 'Wireframes',
        body: ["I laid out the user flow and the features users can interact with."],
        images: [
          { src: 'pizza-wizard/wireframe-main-menu.webp', w: 1920, h: 1080, caption: 'Main menu wireframe, annotated.' },
          { src: 'pizza-wizard/wireframe-error-prevention.webp', w: 1920, h: 1080, caption: 'Error prevention: confirming before an item is removed from the bag.' },
        ],
      },
      {
        title: 'Style Guide',
        body: ["A guide to how the kiosk is styled, built on a design system with annotations for every detail."],
        cols: 2,
        images: [
          { src: 'pizza-wizard/style-iconography.webp', w: 1920, h: 1080, caption: 'Iconography' },
          { src: 'pizza-wizard/style-color.webp', w: 1920, h: 1080, caption: 'Color palette' },
          { src: 'pizza-wizard/style-typography.webp', w: 1920, h: 1080, caption: 'Typography' },
          { src: 'pizza-wizard/style-buttons.webp', w: 1920, h: 1080, caption: 'Buttons' },
        ],
      },
      {
        title: 'Final Design',
        cols: 2,
        images: [
          { src: 'pizza-wizard/final-loading.webp', w: 2000, h: 1499, caption: 'Loading: “Casting up some pizza.”' },
          { src: 'pw-menu.webp', w: 1600, h: 1199, caption: 'Menu' },
          { src: 'pw-item-select.webp', w: 1600, h: 1199, caption: 'Item select, with required choices' },
          { src: 'pizza-wizard/final-order-complete.webp', w: 2000, h: 1499, caption: 'Order complete: receipt options' },
        ],
      },
      {
        title: 'Reflection',
        take: "It was each step of the process, not just the polished outcome, that taught me the most.",
        body: [
          "Effective UX is built on comprehensive systems that balance creativity, accessibility, and real-world constraints.",
          "As a designer, this project taught me how to adapt. It pushed me to think critically about how people interact with digital kiosks in public spaces and retail settings, and about the limitations different users bring with them. I explored everything from systems thinking and UX workflow logic to visual hierarchy, accessibility, and motion as a storytelling tool.",
          "This project challenged me to design a kiosk experience that was imaginative, functional, and grounded in real-world constraints. Along the way, I deepened my understanding of how to shape user flows, design with intent, and build systems that feel cohesive from start to finish. Through every stage of research, ideation, documentation, and refinement, I kept the end user in mind. In the end, it was each step of the process, not just the polished outcome, that taught me the most.",
        ],
      },
    ],
  },
  {
    title: 'Mofuda', cat: 'Interactive — Virtual pet', img: 'mofuda.webp', fit: 'contain',
    cover: { src: 'mofuda/cover.jpg', w: 2000, h: 1124, caption: 'Mofuda, at the foot of the mountain.' },
    summary: "Mofuda is a Tamagotchi-style virtual pet: a bear with the patience of a Daruma, steeped in Buddhist teachings and wisdom.",
    facts: [
      ['Course', 'Interactive Design II (NMDE 203), RIT'],
      ['When', 'Spring 2023'],
      ['Tools', 'Figma, Spline, After Effects'],
    ],
    sections: [
      {
        title: 'Backstory',
        take: "Monks put the spirit of a bear and the patience of a Daruma inside a Tamagotchi. Years later it turned up in a Kyoto antique shop.",
        body: [
          "In a monastery beneath a Fuji-like mountain, monks once fused ancient wisdom with modern code. Their greatest creation was a Tamagotchi: not a toy, but a vessel. Inside it they placed the spirit of a bear and the patience of a Daruma. His name was Mofuda.",
          "Years later, a curious sophomore from RIT found the Tamagotchi in a Kyoto antique shop. “It helps you understand yourself,” the shopkeeper said. They meditated, shared tea and sang karaoke. Before Robert left Japan, Mofuda disappeared, leaving one final message: “Goodbye. Love yourself. And take the path no one’s walking.”",
        ],
        images: [{ src: 'mofuda/process-comic.jpg', w: 750, h: 1101, caption: 'The backstory as a comic.' }],
        layout: 'split',
      },
      {
        title: 'Case and Character',
        items: [
          ['Case', '4.87 × 2.31'],
          ['Screen', '250 × 200'],
          ['Controls', 'Drag left and right, confirm button'],
          ['Inspiration', 'Fidget Cube, traditional Tamagotchi, iPod Nano'],
        ],
        images: [{ src: 'mofuda/case.jpg', w: 2000, h: 930, caption: 'The carved-wood case and its button states.' }],
      },
      {
        title: 'Intro Screens',
        take: "A Game Boy Advance-style start-up, then Mofuda rocks back and forth while his health ticks down.",
        body: ["An intro video inspired by the Game Boy Advance start-up plays first. A prompt asks you to hit the main button, then Mofuda rocks back and forth to show he’s alive. His health drops by 5 every second."],
        images: [{ src: 'mofuda/intro.jpg', w: 1830, h: 735, caption: 'Intro video, start prompt, idle.' }],
      },
      {
        title: 'Loading Screens',
        take: "Every loading screen carries a piece of Mofuda’s wisdom, and one hides a secret level.",
        body: [
          "Loading screens are the transitions between sections, and each one carries a piece of Mofuda’s wisdom. Each is coloured for its stage; karaoke got the funky colours. Some of the wisdom is about design, because Mofuda and Robert learned from each other.",
          "One loading screen hides a secret: press the main button and you skip to a secret level.",
        ],
        images: [{ src: 'mofuda/loading.jpg', w: 2000, h: 579, caption: 'Four loading screens, four pieces of wisdom.' }],
      },
      {
        title: 'Menu',
        take: "Four places to go: tea, karaoke, meditation, or back home.",
        body: ["The menu sends Mofuda to drink tea (teacup), sing karaoke (music note), meditate (lotus flower) or go back to idle (house). I know the drag-to-select controls hinder accessibility, and I’m aware of that problem."],
        images: [{ src: 'mofuda/menu.jpg', w: 1290, h: 681, caption: 'Menu assets over the meadow.' }],
        layout: 'split',
      },
      {
        title: 'Play Screens',
        take: "Doing something you like makes you feel better, so every activity adds health, and Mofuda can go past 100.",
        items: [
          ['Meditate', '+5 health per second.'],
          ['Karaoke', '+1 health per second.'],
          ['Tea', '+5 health for each sip; keep feeding him tea.'],
          ['Secret', 'A little too much tea and a bad trip. You get here by pressing the button on a loading screen: karma for anyone who mashes it to make loading go faster.'],
        ],
        body: ["Most people’s activities took health away, but when you do something you like, you feel better, not worse. Mofuda can also go past 100, because you’re not limited by the bounds of 100. Mofuda taught me that."],
        images: [{ src: 'mofuda/play.jpg', w: 2000, h: 580, caption: 'Meditation, karaoke, tea, and the secret stage.' }],
      },
      {
        title: 'Health and Death', cols: 2,
        take: "The bar goes from green to orange to red. Under 5, Mofuda ascends and leaves you with some wisdom.",
        body: ["Health starts at 100 in green. Below 70 the bar turns orange and the icon changes; below 30 it turns red, and below 15 the icon goes to the dead look. Under 5, the death animation plays: Mofuda ascends into his final form, says goodbye and leaves you with some wisdom."],
        images: [
          { src: 'mofuda/health-meters.png', w: 450, h: 900, caption: 'Health progression.' },
          { src: 'mofuda/death.jpg', w: 750, h: 900, caption: 'His final form.' },
        ],
      },
      {
        title: 'Site Map and User Flow', cols: 2,
        images: [
          { src: 'mofuda/sitemap.png', w: 1935, h: 960, caption: 'Site map.' },
          { src: 'mofuda/userflow.png', w: 1200, h: 1200, caption: 'User flow.' },
        ],
      },
      {
        title: 'Process',
        body: ["I modelled Mofuda in Spline, explored him as a Daruma, in pixel art and as an illustration, then built the prototype in Figma."],
        images: [
          { src: 'mofuda/process-renders.jpg', w: 1800, h: 1200, caption: 'Character explorations.' },
          { src: 'mofuda/process-prototypes.jpg', w: 2000, h: 675, caption: 'Early screens and case studies.' },
          { src: 'mofuda/process-assets.jpg', w: 2000, h: 1077, caption: 'Health meters, icons and menu assets.' },
        ],
      },
      {
        title: 'Style', layout: 'split',
        body: ["Greens for life and the button, warm browns for the wood case. Poppins for reading, Pixelade for the screen."],
        images: [{ src: 'mofuda/style.png', w: 900, h: 1065, caption: 'Palette and type.' }],
      },
      {
        title: 'Reflection',
        take: "Doing everything by hand cost me consistency. Mofuda taught me to step back and enjoy where I am.",
        body: [
          "I learned so much Figma and Spline, and a little more After Effects. I loved creating the character and bringing him to life.",
          "My biggest challenge was components. I couldn’t figure them out, so I did everything by hand, and learned the hard way that doing it by hand costs you consistency between assets. I made the project harder than it had to be, and I hope to come back and rebuild it properly.",
          "Mofuda is the embodiment of me reframing my situation at the time. He would say to take a step back and enjoy where you are, not where you’re going. Stay in the present; it is a gift. I learned how to model a character, how to use interactions, and how to reframe any situation.",
        ],
      },
    ],
  },
  {
    title: 'Digital ID', cat: 'UX/UI — Mobile app', img: 'digital-id.webp', fit: 'contain',
    summary: "A digital driver's licence for the phone.",
    facts: [
      ['Tabs', 'ID, barcode, age check'],
    ],
    sections: [
      {
        title: 'Research',
        body: [{ ph: 'Research text: who uses it, where, and what a physical licence gets wrong.' }],
        images: [{ ph: 'Research / existing licences', ratio: '16/9' }],
      },
      {
        title: 'Hierarchy', layout: 'split',
        body: ["The holder's photo and name lead the screen, with licence number, class, restrictions, and endorsements grouped underneath, then personal details and signature."],
        images: [{ ph: 'ID screen', ratio: '9/16' }],
      },
      {
        title: 'Three Tabs', cols: 3,
        items: [
          ['ID', "The licence itself."],
          ['Barcode', "A scannable barcode."],
          ['Age check', "Age verification."],
        ],
        images: [{ ph: 'ID tab', ratio: '9/16' }, { ph: 'Barcode tab', ratio: '9/16' }, { ph: 'Age verification tab', ratio: '9/16' }],
      },
      {
        title: 'Final Design', layout: 'media-first',
        images: [{ ph: 'Final screens', ratio: '16/9' }],
        body: [{ ph: 'Final design text.' }],
      },
      {
        title: 'Reflection',
        body: [{ ph: 'Reflection text.' }],
      },
    ],
  },
  {
    title: 'Bacteria Per Pixel', cat: 'Graphic — Image', img: 'bacteria-per-pixel.webp',
    summary: "Bacteria Per Pixel is a graphic piece built from bacteria.",
    facts: [
      ['Palette', 'Acid green, white and black'],
      ['Texture', 'A bacterial strain list set as type'],
    ],
    sections: [
      {
        title: 'The Piece', layout: 'media-first',
        images: [{ src: 'bacteria-per-pixel.webp', w: 1125, h: 2000, caption: 'Bacteria Per Pixel, full image.' }],
        body: [{ ph: 'Concept text: where the idea came from.' }],
      },
      {
        title: 'Form', layout: 'split',
        body: ["The image is broken into flat acid-green, white, and black shapes."],
        images: [{ ph: 'Colour / shape breakdown', ratio: '1/1' }],
      },
      {
        title: 'Type as Texture', cols: 2,
        body: ["Lines from a bacterial strain list, species names and culture-collection numbers, are set through it as texture."],
        images: [{ ph: 'Detail: strain list type', ratio: '1/1' }, { ph: 'Detail: culture numbers', ratio: '1/1' }],
      },
      {
        title: 'Process',
        body: [{ ph: 'Process text: tools, iterations, print or screen output.' }],
        images: [{ ph: 'Process / iterations', ratio: '16/9' }],
      },
    ],
  },
  {
    title: 'Hanafuda Cards', cat: 'Graphic — Card deck', img: 'Darumaoslo.png', fit: 'contain',
    summary: "A hanafuda-inspired reimagining of the standard 52-card deck.",
    facts: [
      ['Set', 'Full 54-card set'],
      ['Suits', 'Cherry blossom, plum blossom, fern'],
    ],
    sections: [
      {
        title: 'Suits', layout: 'media-first', cols: 3,
        images: [{ ph: 'Cherry blossom suit', ratio: '5/7' }, { ph: 'Plum blossom suit', ratio: '5/7' }, { ph: 'Fern suit', ratio: '5/7' }],
        body: ["Each suit is re-skinned around a Japanese floral motif (cherry blossom, plum blossom, fern) in place of the usual clubs and spades."],
      },
      {
        title: 'Face Cards', layout: 'split',
        body: ["Every face card pairs two daruma dolls instead of a royal portrait."],
        images: [{ ph: 'Daruma face card', ratio: '5/7' }],
      },
      {
        title: 'Bilingual Ranks',
        body: ["Rank markers run bilingual, Western digits alongside kanji, so the whole deck stays legible while reading as unmistakably hanafuda."],
        images: [{ ph: 'Rank marker detail', ratio: '16/9' }],
      },
      {
        title: 'The Set',
        items: [
          ['Cards', "Full 54-card set."],
          ['Illustration', "Suits, face cards, and daruma."],
          ['System', "Suit and color system."],
          ['Print', "Print-ready layout."],
        ],
        images: [{ ph: 'Full deck spread', ratio: '16/9' }],
      },
      {
        title: 'In Progress',
        body: ["The remaining suits and the box design are in progress."],
        images: [{ ph: 'Box design (coming soon)', ratio: '16/9' }],
      },
    ],
    tag: 'WIP: remaining suits + box design in progress',
  },
];
