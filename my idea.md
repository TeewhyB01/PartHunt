Below is a detailed Product Requirements Document and build prompt you can give to Codex.

You can paste the whole thing into Codex and ask it to build the first version.

# Product Requirements Document: Car Scrap Part Finder Web App

## 1. Product Name

**PartHunt AI**
Alternative names:

* ScrapPart Finder
* AutoPart Scout
* PartLink
* BreakerFind
* CarPart Navigator

## 2. Product Summary

Build a web app that helps users find used, scrap, recycled, or replacement car parts online.

Users should be able to search by:

* Car part number
* Vehicle make, model, and year
* Selecting a part from an interactive vehicle model

The app should then search the web for available parts from scrapyards, breakers, marketplaces, salvage websites, eBay, Facebook Marketplace-style listings, car part retailers, and general web sources.

Search results should appear inside the app first, with a clear link to the original website.

The app should also include a chatbox where users can speak with an agent or AI assistant to help identify parts, refine searches, or explain compatibility.

The design should be simple, minimalistic, futuristic, soft, and calming.

---

# 3. Problem Statement

Finding used or scrap car parts online is difficult because users often do not know:

* The correct part name
* The correct part number
* Whether the part fits their specific vehicle
* Which websites to search
* Whether a part from another model or year is compatible
* Whether the seller looks trustworthy

Most users search manually across Google, eBay, breakers’ websites, Facebook groups, and salvage yards. This takes time and often leads to confusion.

This app solves the problem by giving users one simple search platform where they can identify the right car part and find matching results from across the web.

---

# 4. Target Users

## Primary Users

Car owners looking for affordable replacement parts.

Examples:

* A driver looking for a used bumper
* Someone who needs a replacement wing mirror
* A person trying to find a gearbox, alternator, light cluster, ECU, or door panel

## Secondary Users

* Mechanics
* Body repair shops
* Car breakers
* Scrap yards
* Used car dealers
* DIY repair enthusiasts
* Insurance repair agents

---

# 5. Core User Journey

## Journey 1: Search by Part Number

1. User opens the app.
2. User enters a part number.
3. App asks optional details:

   * Make
   * Model
   * Year
   * Fuel type
   * Engine size
   * Body type
4. App searches the web for matching parts.
5. Results appear inside the app.
6. User filters results by:

   * Price
   * Location
   * Condition
   * Website/source
   * Delivery availability
7. User clicks “View Original Listing” to visit the seller’s website.

## Journey 2: Search by Vehicle Details

1. User enters:

   * Make
   * Model
   * Year
   * Trim, if known
2. App displays a visual model or diagram of the selected car.
3. Car parts are clickable.
4. User clicks the specific part they need.
5. App confirms the selected part.
6. App runs a web search for that part.
7. Results appear inside the app.

## Journey 3: Assisted Search Through Chatbox

1. User opens the chatbox.

2. User types something like:

   “I need the plastic thing under my front bumper for a 2017 Ford Focus.”

3. Agent/AI asks follow-up questions.

4. Agent/AI suggests likely part names:

   * Front bumper lower grille
   * Undertray
   * Splash shield
   * Front valance

5. User confirms the correct part.

6. App searches the web.

7. Results are displayed.

---

# 6. Core Features

## 6.1 Homepage

The homepage should be clean and simple.

It should include:

* App logo
* Short headline
* Search bar
* Option to search by part number
* Option to search by vehicle
* Chatbox icon
* Minimal navigation

Suggested homepage headline:

**Find the exact car part you need, faster.**

Subheading:

**Search by part number, vehicle details, or select the part directly from an interactive car model.**

Main buttons:

* Search by Part Number
* Search by Vehicle
* Ask an Agent

---

## 6.2 Search by Part Number

Users should be able to enter a part number directly.

Fields:

* Part number
* Vehicle make, optional
* Vehicle model, optional
* Year, optional
* Engine size, optional
* Fuel type, optional
* Transmission, optional

The app should then create a search query using the part number and optional vehicle details.

Example search query:

`"Ford Focus 2017 front bumper grille part number XXXXX used scrap breaker"`

The app should return structured results.

Each result card should show:

* Part name
* Price, if available
* Source website
* Seller/location, if available
* Condition, if available
* Image, if available
* Short listing description
* Compatibility notes, if available
* Link to original page

---

## 6.3 Search by Vehicle

Users should be able to enter vehicle details.

Required fields:

* Make
* Model
* Year

Optional fields:

* Trim
* Engine size
* Fuel type
* Transmission
* Body type
* Registration number, optional future feature

Example:

* Make: Ford
* Model: Focus
* Year: 2017
* Body type: Hatchback

After the user enters these details, the app should show an interactive vehicle model.

---

## 6.4 Interactive Vehicle Model

This is one of the most important features.

The app should display a simplified 3D-style or 2D futuristic car diagram.

The user should be able to click areas of the vehicle.

Clickable categories should include:

Exterior:

* Front bumper
* Rear bumper
* Bonnet
* Boot lid
* Front left door
* Front right door
* Rear left door
* Rear right door
* Front left wing
* Front right wing
* Rear quarter panel
* Roof
* Wing mirrors
* Headlights
* Tail lights
* Fog lights
* Grille
* Windscreen
* Rear window
* Side windows
* Alloy wheels
* Tyres

Engine bay:

* Engine
* Alternator
* Starter motor
* Radiator
* Battery
* Turbocharger
* Air filter box
* ECU
* Fuse box
* Coolant reservoir
* Washer bottle

Interior:

* Steering wheel
* Dashboard
* Instrument cluster
* Seats
* Centre console
* Gear selector
* Door cards
* Airbags
* Seat belts
* Infotainment screen

Undercarriage:

* Exhaust
* Catalytic converter
* Suspension
* Shock absorbers
* Brake calipers
* Brake discs
* Driveshaft
* Gearbox
* Fuel tank

When a user hovers over a part:

* Highlight the part softly
* Show part name
* Show a small tooltip

When a user clicks a part:

* Open a side panel
* Show part name
* Show alternative names
* Ask the user to confirm the part
* Offer “Search this part”

Example:

Selected part: **Front bumper**

Alternative names:

* Front bumper cover
* Front bumper assembly
* Front bumper skin
* Front valance

Button:

**Find this part**

---

## 6.5 Search Results Page

The search results should be displayed inside the app.

The user should not immediately be redirected away.

Each result should appear as a card.

Result card fields:

* Image
* Part title
* Price
* Source
* Location
* Condition
* Compatibility
* Delivery option
* Seller rating, if available
* Date listed, if available
* Original listing link

Actions:

* View Original Listing
* Save Part
* Compare
* Ask Agent About This
* Report Incorrect Match

Filters:

* Price range
* Location
* Website/source
* Condition
* Delivery available
* Exact match only
* Used
* Refurbished
* New
* Scrap/breaker part

Sorting:

* Best match
* Lowest price
* Nearest location
* Newest listing
* Most trusted source

---

## 6.6 Web Search Functionality

The app should perform a general web search using the user’s query.

The app should search across sources such as:

* Google-style web results
* eBay
* BreakerLink
* 1st Choice Spares
* Parts Gateway
* ASM Auto Recycling
* Synetiq
* local breaker yards
* online salvage websites
* car forums
* marketplace-style listings

For MVP, use a search API rather than scraping websites directly.

Recommended options:

* SerpAPI
* Bing Web Search API
* Google Custom Search API
* Brave Search API
* Tavily API
* Exa API

Do not scrape websites unless legally permitted.

The app should generate smart queries based on user input.

Example queries:

For part number:

`"{partNumber}" "{make}" "{model}" used car part`

For selected vehicle part:

`"{year}" "{make}" "{model}" "{partName}" used breaker scrap`

For broader search:

`"{make}" "{model}" "{partName}" salvage yard UK`

For exact match:

`"{partNumber}"`

---

## 6.7 Chatbox / Agent Support

The app should include a floating chatbox.

Position:

* Bottom right on desktop
* Bottom fixed button on mobile

Chatbox functions:

* Help users identify parts
* Ask follow-up questions
* Explain alternative part names
* Help users refine searches
* Help users compare results
* Explain compatibility issues
* Recommend what details to check before buying

Example chat interaction:

User:

“I need the plastic cover under my engine.”

Agent:

“That may be called an engine undertray, splash shield, or lower engine cover. What is your car make, model, and year?”

User:

“2016 BMW 3 Series.”

Agent:

“Thanks. I’ll search for: 2016 BMW 3 Series engine undertray / splash shield used replacement.”

The chatbox should have two modes:

* AI assistant mode
* Human agent handoff mode, future feature

MVP can use AI assistant only.

---

# 7. MVP Scope

The first version should focus on:

* Clean homepage
* Search by part number
* Search by make, model, and year
* Simple interactive 2D car diagram
* Clickable part categories
* Search results page
* External listing links
* Chatbox assistant
* Save search locally
* Mobile responsive design

MVP does not need:

* Full 3D car models
* Live human agents
* User accounts
* Payments
* Seller onboarding
* Real-time scrapyard inventory
* Vehicle registration lookup
* Advanced compatibility database

---

# 8. Future Features

Add later:

* User accounts
* Saved vehicles
* Saved searches
* Saved parts
* Price alerts
* Email alerts
* WhatsApp alerts
* Seller accounts
* Breaker yard dashboard
* VIN lookup
* UK registration lookup
* AI image recognition
* Upload a photo of damaged part
* Part compatibility engine
* In-app checkout
* Delivery tracking
* Mechanic recommendation
* Garage quote comparison
* Mobile app version
* Augmented reality part identification

---

# 9. Design Requirements

## Visual Style

The app should feel:

* Minimalistic
* Futuristic
* Calm
* Clean
* Trustworthy
* Soft
* Easy to use

Avoid:

* Loud colours
* Cluttered dashboards
* Heavy shadows
* Overly technical design
* Aggressive automotive styling

## Colour Palette

Suggested colours:

* Background: soft off-white, pale grey, light mist blue
* Primary: muted electric blue
* Secondary: soft teal
* Accent: gentle violet or cyan
* Text: charcoal or deep navy
* Cards: white or translucent glass effect

Example palette:

* Background: `#F7FAFC`
* Surface: `#FFFFFF`
* Primary: `#4F8CFF`
* Secondary: `#5ED6C8`
* Accent: `#A78BFA`
* Text: `#1F2937`
* Muted text: `#6B7280`
* Border: `#E5E7EB`

## UI Style

Use:

* Rounded cards
* Soft shadows
* Plenty of spacing
* Subtle gradients
* Glassmorphism in small areas
* Smooth hover effects
* Gentle animations
* Thin line icons
* Clean typography

Recommended fonts:

* Inter
* Manrope
* Sora
* Space Grotesk

---

# 10. Main Pages

## 10.1 Homepage

Sections:

* Hero section
* Search box
* “How it works”
* Feature highlights
* Popular searches
* Chatbox

Homepage layout:

Top nav:

* Logo
* Search
* How it Works
* Saved Parts
* Contact

Hero:

* Headline
* Subheading
* Search input
* Search method toggle

Search method toggle:

* Part Number
* Vehicle Details
* Select from Car

---

## 10.2 Vehicle Selection Page

Fields:

* Make
* Model
* Year
* Trim
* Engine size
* Fuel type
* Body type

CTA:

**Show Vehicle Parts**

---

## 10.3 Interactive Car Page

Main content:

* Car diagram
* Clickable parts
* Side panel
* Selected part details
* Search button

Side panel should show:

* Selected part
* Other names
* Common compatibility checks
* Search button

---

## 10.4 Results Page

Sections:

* Search summary
* Filter sidebar
* Results grid/list
* Sort dropdown
* Save search button

Example summary:

**Showing results for: 2017 Ford Focus front bumper used**

---

## 10.5 Saved Parts Page

For MVP, use local storage.

Users can save:

* Search queries
* Result links
* Vehicle details
* Selected parts

---

# 11. Data Model

## Vehicle

```ts
Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  engineSize?: string;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
}
```

## Part

```ts
Part {
  id: string;
  name: string;
  category: string;
  alternativeNames: string[];
  description?: string;
  locationOnVehicle: string;
  compatibilityNotes?: string[];
}
```

## SearchQuery

```ts
SearchQuery {
  id: string;
  type: "part_number" | "vehicle_part" | "chat_assisted";
  partNumber?: string;
  vehicle?: Vehicle;
  selectedPart?: Part;
  rawQuery: string;
  generatedSearchTerms: string[];
  createdAt: string;
}
```

## SearchResult

```ts
SearchResult {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  price?: string;
  currency?: string;
  source: string;
  location?: string;
  condition?: string;
  compatibility?: string;
  listingUrl: string;
  dateListed?: string;
  confidenceScore?: number;
}
```

## ChatMessage

```ts
ChatMessage {
  id: string;
  role: "user" | "assistant" | "agent";
  content: string;
  createdAt: string;
}
```

---

# 12. Recommended Tech Stack

## Frontend

Use:

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Framer Motion
* Lucide icons

## Backend

Use:

* Next.js API routes
* Node.js
* Search API integration
* OpenAI API or another LLM provider for chat assistant

## Database

For MVP:

* Local storage for saved parts

For production:

* Supabase
* PostgreSQL
* Prisma ORM

## Search APIs

Choose one:

* SerpAPI
* Bing Search API
* Brave Search API
* Tavily
* Exa

## Hosting

Use:

* Vercel for frontend and backend
* Supabase for database
* Cloudinary for image handling, future feature

---

# 13. AI Agent Behaviour

The chat assistant should act like a helpful car part search specialist.

It should:

* Ask simple questions
* Avoid technical overload
* Help users identify vague part descriptions
* Suggest alternative names
* Explain what to check before buying
* Warn users about compatibility risks
* Never guarantee fitment unless confirmed by part number or official compatibility data

Agent tone:

* Calm
* Clear
* Practical
* Friendly
* Not too wordy

Example system prompt:

```text
You are a car part finding assistant. Your role is to help users identify the correct vehicle part and create accurate search queries.

Ask for make, model, year, trim, engine size, fuel type, body type, and part number where needed.

If the user describes a part vaguely, suggest possible part names and ask them to confirm.

Always remind users to check compatibility, part number, side of vehicle, condition, seller return policy, and delivery cost before buying.

Do not guarantee compatibility unless the user provides an exact part number and a reliable source confirms it.

Keep responses clear, short, and helpful.
```

---

# 14. Search Query Generation Logic

The app should generate multiple search queries.

Example function logic:

```ts
function generateSearchQueries(input) {
  const queries = [];

  if (input.partNumber) {
    queries.push(`"${input.partNumber}"`);
    queries.push(`"${input.partNumber}" used car part`);
    queries.push(`"${input.partNumber}" breaker salvage`);
  }

  if (input.vehicle && input.part) {
    const base = `${input.vehicle.year} ${input.vehicle.make} ${input.vehicle.model} ${input.part.name}`;
    queries.push(`${base} used`);
    queries.push(`${base} breaker`);
    queries.push(`${base} scrap yard`);
    queries.push(`${base} replacement part`);
    
    input.part.alternativeNames?.forEach(name => {
      queries.push(`${input.vehicle.year} ${input.vehicle.make} ${input.vehicle.model} ${name}`);
    });
  }

  return queries;
}
```

The search API should run these queries and merge results.

Results should be ranked by:

* Exact part number match
* Vehicle make/model/year match
* Part name match
* Trusted source
* Price availability
* Image availability
* Listing freshness

---

# 15. Result Confidence Score

Each result should receive a confidence score.

Scoring idea:

* Exact part number match: +40
* Make match: +10
* Model match: +10
* Year match: +10
* Part name match: +15
* Alternative part name match: +10
* Has image: +5
* Has price: +5
* Trusted source: +10
* Missing key details: -10
* Wrong make/model detected: -30

Display confidence as:

* High match
* Possible match
* Check carefully

Do not show raw numbers to users unless needed.

---

# 16. Safety and Trust Features

The app should include buying guidance.

Each result page should include a small warning:

**Before buying, check the part number, vehicle side, year range, condition, delivery cost, and return policy.**

For certain parts, include extra warnings.

Examples:

Airbags:

* Must be fitted by a qualified professional
* Check legal and safety requirements

ECU:

* May require coding or programming

Lights:

* Check left-hand/right-hand drive compatibility

Body panels:

* Check colour code and facelift/pre-facelift model

Engine/gearbox:

* Confirm engine code and mileage

---

# 17. Accessibility Requirements

The app should be accessible.

Requirements:

* Keyboard navigable
* Clear focus states
* Alt text for images
* Good colour contrast
* Screen reader labels
* Tooltips should also work with keyboard focus
* Mobile-friendly touch targets
* Forms must have labels
* Error messages must be clear

---

# 18. Responsive Design

The app should work well on:

* Desktop
* Tablet
* Mobile

Mobile behaviour:

* Search bar full width
* Filters collapse into drawer
* Car diagram should become scrollable or simplified
* Chatbox should open as full-screen bottom sheet
* Result cards should stack vertically

---

# 19. Non-Functional Requirements

The app should be:

* Fast
* Secure
* Responsive
* Easy to maintain
* Search-engine friendly
* Scalable

Performance targets:

* Homepage loads in under 2 seconds
* Search response starts within 3 seconds where possible
* Results should stream or show loading skeletons
* Images should lazy-load

Security:

* Do not expose API keys in frontend
* Validate user input
* Rate-limit search requests
* Sanitize external result content
* Avoid unsafe HTML rendering
* Use HTTPS

---

# 20. MVP Acceptance Criteria

The MVP is successful when:

* A user can search by part number
* A user can search by make, model, and year
* A user can select a part from a clickable vehicle diagram
* The app generates relevant search queries
* The app returns web results inside the platform
* Each result links to the original website
* A user can open the chatbox and ask for help
* The app works on mobile and desktop
* The design feels minimal, calm, and futuristic

---

# 21. Codex Build Prompt

Paste this into Codex:

```text
Build a full-stack web app called PartHunt AI.

The app helps users find used, scrap, recycled, and replacement car parts online.

Use:
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Lucide React icons
- Next.js API routes

Design style:
- Minimalistic
- Futuristic
- Soft and calming
- Gentle light background
- Rounded cards
- Subtle shadows
- Smooth animations
- Clean typography
- Use Inter or Manrope font
- Use a soft palette: off-white, pale grey, muted blue, teal, and gentle violet

Core pages:
1. Homepage
2. Search by part number
3. Search by vehicle details
4. Interactive car part selector
5. Search results page
6. Saved parts page
7. Floating chatbox

Homepage:
Create a clean hero section with:
- App logo
- Headline: “Find the exact car part you need, faster.”
- Subheading: “Search by part number, vehicle details, or select the part directly from an interactive car model.”
- Search method toggle: Part Number, Vehicle Details, Select from Car
- Main search input
- CTA button: “Find Parts”
- Feature cards explaining: Search, Identify, Compare, Visit Seller

Search by part number:
Create a form with:
- Part number
- Optional make
- Optional model
- Optional year
- Optional engine size
- Optional fuel type
- Optional transmission

Search by vehicle:
Create a form with:
- Make
- Model
- Year
- Trim
- Engine size
- Fuel type
- Transmission
- Body type

Interactive car selector:
Create a simplified futuristic 2D car diagram using SVG or styled divs.
Make the following parts clickable:
- Front bumper
- Rear bumper
- Bonnet
- Boot lid
- Front left door
- Front right door
- Rear left door
- Rear right door
- Wing mirrors
- Headlights
- Tail lights
- Grille
- Wheels
- Engine
- Battery
- Radiator
- Exhaust
- Gearbox
- Seats
- Dashboard

When the user hovers over a part:
- Highlight the part
- Show tooltip with part name

When the user clicks a part:
- Open a right-side detail panel
- Show selected part name
- Show alternative names
- Show compatibility checks
- Show button: “Search this part”

Search results:
Create a results page that displays mock or API-powered web search results as cards.

Each result card should include:
- Image placeholder
- Part title
- Price
- Source website
- Location
- Condition
- Short description
- Match confidence: High match, Possible match, or Check carefully
- Button: “View Original Listing”
- Button: “Save Part”
- Button: “Ask Agent”

Filters:
- Price range
- Location
- Source
- Condition
- Delivery available
- Exact match only

Sorting:
- Best match
- Lowest price
- Nearest location
- Newest listing

Search API:
Create a Next.js API route called `/api/search-parts`.

The route should accept:
- partNumber
- vehicle
- selectedPart
- rawQuery

It should generate search queries like:
- "{partNumber}"
- "{partNumber} used car part"
- "{year} {make} {model} {partName} used"
- "{year} {make} {model} {partName} breaker"
- "{year} {make} {model} {alternativePartName}"

For now, return realistic mock search results.
Structure the code so a real web search API such as SerpAPI, Bing Search API, Brave Search API, Tavily, or Exa can be added later.

Result ranking:
Create a simple confidence scoring function.
Score results based on:
- Part number match
- Make match
- Model match
- Year match
- Part name match
- Alternative name match
- Image available
- Price available
- Trusted source

Saved parts:
Use localStorage for MVP.
Allow users to save search results.
Create a Saved Parts page where users can see saved results and remove them.

Chatbox:
Add a floating chatbox at the bottom right.
The assistant should help users identify parts and refine searches.

Chatbox behaviour:
- User can type a message
- Assistant responds with helpful guidance
- If the user gives vague descriptions, ask for make, model, year, and part location
- Suggest alternative part names
- Warn users to check compatibility before buying

Use mock AI responses for now, but structure it so an OpenAI API integration can be added later.

Example assistant system behaviour:
“You are a car part finding assistant. Help users identify the correct part, ask for make/model/year when needed, suggest alternative part names, and remind users to check part number, side, condition, delivery cost, and return policy before buying.”

Data models:
Create TypeScript interfaces for:
- Vehicle
- Part
- SearchQuery
- SearchResult
- ChatMessage

Accessibility:
- Use semantic HTML
- Labels for all inputs
- Keyboard navigable controls
- Clear focus states
- Alt text for images
- Good contrast

Responsive design:
- Desktop: two-column layouts where appropriate
- Mobile: single-column cards
- Filters should collapse into a drawer or accordion
- Chatbox should become a bottom sheet on mobile

Important:
- Do not build payment features
- Do not build user authentication yet
- Do not scrape websites directly
- Use mock data for the first version
- Keep code clean, modular, and easy to extend
- Add comments only where useful
- Prioritise a polished MVP experience
```

---

# 22. Suggested First Build Milestones

## Milestone 1: Frontend Prototype

Build:

* Homepage
* Vehicle form
* Part number form
* Interactive car selector
* Mock results page
* Chatbox UI

## Milestone 2: Search Logic

Add:

* Query generator
* Mock API route
* Result ranking
* Filters
* Sorting

## Milestone 3: Saved Parts

Add:

* Save result
* Remove saved result
* Local storage
* Saved parts page

## Milestone 4: AI/Search Integration

Add:

* Real search API
* Real AI assistant
* Search result enrichment
* Confidence scoring improvements

## Milestone 5: Production Polish

Add:

* Rate limiting
* Error handling
* Loading skeletons
* Empty states
* Mobile improvements
* Deployment to Vercel

---

# 23. Key Build Advice

Start with mock data first.

Do not try to build the full car parts database immediately.

The hardest parts will be:

* Accurate part identification
* Car compatibility
* Web search quality
* 3D/interactive car model

For MVP, use a clean 2D clickable diagram.

Then improve it later with:

* Better vehicle diagrams
* Real OEM part databases
* VIN/reg lookup
* AI image upload
* Breaker yard integrations
