# Duurzaamheidsversneller (Sustainability Accelerator)

> **📝 Documentation Maintenance**: This file should be updated whenever significant changes are made to the application architecture, styling approach, data models, or key features. Keep it synchronized with the actual codebase.

## Overview
Duurzaamheidsversneller is a Next.js web application designed to calculate costs for energy efficiency improvements and retrofitting measures for Dutch residential buildings. The application helps housing corporations and property managers plan sustainability investments by providing detailed cost breakdowns based on building characteristics and selected improvement measures.

## Tech Stack
- **Framework**: Next.js 15.1.3 (App Router)
- **Runtime**: React 19.0.0
- **Language**: TypeScript 5
- **Database**: MongoDB 6.12.0
- **Styling**:
  - Sass 1.83.0 (custom SCSS modules only)
  - Organized in modular structure under `src/scss/`
- **UI Components**:
  - Lucide React (icons)
  - Sonner (toast notifications)
- **Build Tool**: Turbopack (--turbopack flag in dev mode)

## Project Structure

```
/
├── .claude/                    # Claude Code settings
├── public/                     # Static assets (images)
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── admin/            # Admin panel routes
│   │   │   ├── berekeningen/ # Calculations management
│   │   │   ├── instellingen/ # Settings
│   │   │   ├── maatregelen/  # Measures (retrofitting options)
│   │   │   ├── scenarios/    # Scenario management
│   │   │   ├── woning-types/ # Building type definitions
│   │   │   ├── woningen/     # Saved buildings
│   │   │   └── opgeslagen-woningen/ # Stored building profiles
│   │   ├── actions/          # Server actions
│   │   ├── kosten-berekening/ # Cost calculation page (Step 2)
│   │   ├── vergelijken/      # Comparison page
│   │   └── page.tsx          # Homepage (Step 1)
│   │
│   ├── components/            # UI components (Atomic Design)
│   │   ├── atoms/            # Basic building blocks
│   │   ├── molecules/        # Composite components
│   │   ├── organisms/        # Complex components
│   │   └── templates/        # Page layouts
│   │
│   ├── modules/              # Feature modules
│   │   ├── details/          # Detail handler
│   │   ├── fields/           # Form field components
│   │   ├── footer/           # Footer component
│   │   ├── forms/            # Form components
│   │   ├── frontend/         # Frontend-specific components
│   │   │   └── calculations/ # Calculation components
│   │   ├── header/           # Header/navigation
│   │   ├── residenceProfile/ # Building profile management
│   │   ├── scenario/         # Scenario features
│   │   └── search/           # Search functionality
│   │
│   ├── contexts/             # React Context providers
│   │   └── DataContext.tsx   # Generic data context factory
│   │
│   ├── repositories/         # Data access layer
│   │   ├── base.repository.ts     # Base CRUD operations
│   │   ├── calculation.repository.ts
│   │   ├── measure.repository.ts
│   │   ├── profile.repository.ts
│   │   ├── settings.repository.ts
│   │   └── woning.repository.ts
│   │
│   ├── types/                # TypeScript type definitions
│   │   ├── calculation.ts    # Calculation types
│   │   ├── measures.ts       # Measure types
│   │   ├── profile.ts        # Profile types
│   │   ├── settings.ts       # Settings types
│   │   ├── types.ts          # Generic types
│   │   └── woningen.ts       # Building types
│   │
│   ├── lib/                  # Utility libraries
│   │   ├── database/         # MongoDB connection
│   │   └── calculations/     # Calculation utilities
│   │
│   ├── services/             # Business logic services
│   ├── hooks/                # Custom React hooks
│   └── scss/                 # Global styles
│       ├── abstracts/        # Variables, mixins
│       ├── animations/       # Animation definitions
│       ├── base/            # Base styles
│       └── ui/              # UI component styles
│
├── package.json
├── next.config.ts
├── postcss.config.mjs
└── tsconfig.json
```

## Core Concepts

### 1. Building Types (Woningen)
The application manages three types of Dutch residential buildings:
- **Grondgebonden**: Ground-level houses (row houses, detached homes)
- **Portiekflat**: Apartment buildings with shared entrances
- **Galerieflat**: Gallery-access apartment buildings

Each building type has specific characteristics:
- Project information (address, postal code, renovation year, construction period)
- Energy details (current energy label, target label, consumption)
- Dimensions (width, depth, roof height, number of units)
- Room dimensions and window specifications

### 2. Retrofitting Measures (Maatregelen)
Measures represent energy efficiency improvements:
- **Groups**: Wall insulation, roof insulation, floor insulation, windows, HVAC systems, solar panels
- **Pricing components**: Material costs, labor, percentages for extras
- **Heat demand values**: Different values per building type and construction period
- **Maintenance costs**: Long-term maintenance calculations (40-year lifecycle)

### 3. Calculation Flow
The application follows a two-step process:

#### Step 1: Building Information (`/`)
- User enters project details
- Selects or creates building type
- Specifies dimensions and characteristics
- Can save building profiles for later use

#### Step 2: Cost Calculation (`/kosten-berekening`)
- Displays available retrofitting measures
- User selects measures to apply
- Real-time calculation of:
  - Installation costs per measure
  - Total project budget
  - Energy demand reduction
  - Maintenance costs (per year and 40-year total)
  - Energy label improvements
- Can save calculations as scenarios
- PDF export functionality
- Comparison with other saved profiles

### 4. Data Architecture

#### Repository Pattern
All database operations use the repository pattern with a base class providing CRUD operations:
```typescript
BaseRepository<T>
  ├── create()
  ├── findById()
  ├── findAll()
  ├── update()
  ├── delete()
  ├── search()
  └── count()
```

Specific repositories extend this base:
- `MeasureRepository`: Manages retrofitting measures
- `WoningRepository`: Manages building data
- `CalculationRepository`: Manages saved calculations
- `ProfileRepository`: Manages building profiles
- `SettingsRepository`: Manages application settings

#### Context Pattern
The application uses a context factory pattern for data management:
```typescript
createDataContext(collectionName) → { DataProvider, useData }
```

This creates type-safe contexts for different collections:
- `MeasureProvider` / `useMeasureData()`
- `WoningenProvider` / `useWoningenData()`
- `TypesProvider` / `useTypesData()`
- `ScenariosProvider` / `useScenariosData()`
- `VariableProvider` / `useVariableData()`

Each context provides:
- `items`: Current list of items
- `selectedItem`: Currently selected item
- `isLoading`: Loading state
- `error`: Error messages
- `isEditing`: Edit mode flag
- `pendingChanges`: Unsaved changes tracking
- `searchItems()`: Search functionality
- `selectItem()`: Item selection
- `createItem()`: Create new items
- `updateItem()`: Update existing items

### 5. Key Components

#### Frontend Components
- **`Hero`**: Page header with title and image
- **`Step`**: Step indicator for multi-step process
- **`ProjectForm`**: Building information form
- **`CostForm`**: Main calculation form with measure selection
- **`MeasureList`**: List of available measures
- **`SelectedMeasures`**: Display of chosen measures
- **`Budget`**: Budget summary display
- **`Stats`**: Calculation statistics
- **`Residence`**: Building-specific calculations
- **`EnergyLabel`**: Energy label visualization

#### Admin Components
- **`AdminCRUD`**: Generic CRUD template for admin pages
- **`DetailHandler`**: Handles detail view and editing
- **`SearchResults`**: Search result display
- **`SearchBar`**: Search functionality
- **`FormField`**: Generic form field component

#### Atomic Design Components
- **Atoms**: `Button`, `Input`, `Checkbox`, `Label`, `Select`, `TextField`
- **Molecules**: `FormField`, `SearchBar`, `DetailControls`, `SaveProfileButton`
- **Organisms**: Full-featured components like forms and complex layouts
- **Templates**: Layout components combining multiple organisms

### 6. Calculation Engine

The application performs complex calculations based on:
1. **Building dimensions**: Calculates surface areas for walls, roof, floor
2. **Window specifications**: Counts windows by size categories, calculates total surface area
3. **Construction period**: Applies period-specific heat demand values
4. **Building type**: Uses type-specific calculation formulas
5. **Selected measures**: Aggregates costs and energy savings

Key calculation outputs:
- Wall surface area (front, back, total, net)
- Roof surface area (with overhang)
- Floor surface area
- Window surface area and count by size
- Window perimeter (for frame calculations)
- Total installation cost per measure
- Maintenance costs (yearly and 40-year lifecycle)
- Heat demand reduction
- Energy label projection

### 7. Admin Panel

The admin section (`/admin`) provides full CRUD functionality for:
- **Maatregelen**: Manage retrofitting measures and their pricing
- **Woning Types**: Define building templates with default dimensions
- **Instellingen**: Configure application settings and variables
- **Scenarios**: Manage saved calculation scenarios
- **Berekeningen**: View and manage all saved calculations
- **Opgeslagen Woningen**: Manage saved building profiles

## Database Schema

### Collections
1. **woningen**: Saved building data
2. **types**: Building type templates
3. **retrofittingMeasures**: Available improvement measures
4. **calculations**: Saved cost calculations
5. **scenarios**: Named calculation scenarios
6. **variables**: Application configuration variables
7. **profiles**: Saved building profiles for comparison

## Environment Variables
- `MONGODB_URI`: MongoDB connection string (stored in `.env.local`)

## Development

### Running the application
```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Key Scripts
- **Utility scripts** (root directory):
  - `add-residence-references.js`: Add references to buildings
  - `check-duplicates.js`: Check for duplicate data
  - `convert-measures-to-scenarios.js`: Convert measures to scenarios
  - `find-teststraat-woning.js`: Find test building data

## Styling Approach

**The application uses custom SCSS modules exclusively.** All styling is organized in `src/scss/` with the following structure:

- **`abstracts/`**: Variables, mixins, functions, and design tokens
- **`base/`**: Reset styles, typography, and base element styles
- **`animations/`**: Keyframe animations and transitions
- **`ui/`**: Component-specific styles organized by feature:
  - `forms/`: Form component styles (`_residence-form.scss`, `_scenario-form.scss`, etc.)
  - `frontend/`: Frontend-specific UI styles (`_selected-measures.scss`, etc.)
  - `details/`: Detail view styles
  - Component styles: `_tiles.scss`, `_search-select.scss`, `_form-fields.scss`, etc.

### Styling Guidelines
- Use semantic class names that describe the component's purpose
- Leverage SCSS features: variables, nesting, mixins, and functions
- Keep component styles modular and organized by feature
- Use BEM (Block Element Modifier) naming convention where appropriate
- Import styles in components via `import '@/scss/path/to/styles.scss'`

## Features

### User Features
1. **Multi-step building data entry**
2. **Real-time cost calculations**
3. **Measure selection with live budget updates**
4. **Building profile saving and loading**
5. **PDF export of calculations**
6. **Comparison between different building profiles**
7. **Energy label projection**
8. **40-year lifecycle cost analysis**

### Admin Features
1. **Full CRUD for all data entities**
2. **Search functionality across all collections**
3. **Inline editing with change tracking**
4. **Import/export capabilities** (via utility scripts)
5. **Password protection** for admin sections
6. **Detailed form validation**

## Recent Development
Based on recent commits:
- Added residence reference system
- Implemented profile saving functionality
- Added comparison feature for building profiles ("verglijken")
- Restructured code organization
- Enhanced window dimension tracking (kozijnaantal, kozijnbreedtetotaal)
- Created scenario management system

## Future Considerations
- The `src/lib/calculations/` directory is currently empty, suggesting calculation logic may be distributed across components or planned for consolidation
- Several TypeScript files indicate work in progress on scenario management
- The application uses both `components/` and `modules/` directories, which could be consolidated for consistency
- **Styling Migration**: Transitioning from Tailwind CSS to SCSS-only. Any remaining Tailwind classes should be converted to custom SCSS modules following the established pattern in `src/scss/`
