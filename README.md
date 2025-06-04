# Engineering Project Management System

A role-based project management system built with React, TypeScript, and Node.js that enables efficient project tracking and management for engineering teams.

## Features

- Role-based access control (RBAC) for managers and engineers
- View-only interface for engineers to track assigned projects
- Project details including status, timeline, required skills, and team size
- Real-time project status updates with color-coded indicators
- Secure authentication and authorization

## Tech Stack

- Frontend: React, TypeScript, TailwindCSS
- Backend: Node.js, Express
- Database: MongoDB
- Authentication: JWT

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB

## Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Workasana.git
cd Workasana
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Create a `.env` file in the backend directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

4. Start the development servers:
```bash
# Start backend server
cd backend
npm run dev

# In a new terminal, start frontend server
cd frontend
npm start
```

## AI Development Journey

### AI Tools Used

1. **GitHub Copilot**
   - Used for real-time code suggestions
   - Helped with TypeScript interface definitions
   - Assisted in writing utility functions

2. **Claude AI (via Cursor IDE)**
   - Helped with component architecture
   - Generated boilerplate code
   - Assisted with TypeScript migrations
   - Provided code reviews and suggestions

### How AI Accelerated Development

1. **Component Creation**
   - AI helped generate the initial structure for `MyProjects.tsx`
   - Suggested proper TypeScript interfaces for Project and Assignment types
   - Generated consistent styling using TailwindCSS

2. **TypeScript Migration**
   - AI assisted in converting JavaScript components to TypeScript
   - Automatically suggested proper type definitions
   - Helped identify and fix type-related issues

3. **Role-Based Access Control**
   - AI provided patterns for implementing RBAC
   - Generated authentication checks and route protection logic
   - Suggested security best practices

### Challenges and Solutions

1. **Challenge**: Initial AI-generated code had incomplete type definitions
   - **Solution**: Manually reviewed and enhanced type definitions
   - Added proper interface documentation
   - Implemented stricter type checking

2. **Challenge**: AI sometimes generated overly complex solutions
   - **Solution**: Simplified code structure
   - Focused on maintainability
   - Kept only necessary features

3. **Challenge**: Inconsistent styling suggestions
   - **Solution**: Established a consistent design system
   - Created reusable TailwindCSS classes
   - Maintained uniform component styling

### Validation Approach

1. **Code Review Process**
   - Manually reviewed all AI-generated code
   - Tested edge cases and error scenarios
   - Verified type safety and null checks

2. **Testing Strategy**
   - Implemented unit tests for critical functions
   - Conducted integration testing for API interactions
   - Performed manual testing for UI components

3. **Performance Validation**
   - Monitored component render performance
   - Optimized data fetching and caching
   - Implemented proper React hooks usage

## Thank You
