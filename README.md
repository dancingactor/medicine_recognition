# Pills Factory Admin Console

This website is our console for pills factory admin to examinate the pills' situation.  
We aim at addressing the deficiency of worker in pills production.  
We leverage the ability of ICAM to capture the defected pills and calculate the defection rate.

## Features

- Real-time monitoring of pill production lines
- Automatic detection and calculation of defected pills using ICAM
- Visualization of defection rates and production statistics
- Event logs and AI suggestions for process improvement
- Admin dashboard for batch and event management

## Getting Started

### Prerequisites

- Node.js (v18 or above)
- npm or yarn

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/your-org/medicine_recognition.git
    cd medicine_recognition
    ```

2. Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3. Set up environment variables:  
   Copy `.env.example` to `.env.local` and fill in your AWS and other required credentials.

### Running the App

```bash
npm run dev

```

The app will be available at [http://localhost:3000](http://localhost:3000).
If you do not want to clone it, you can also access the Website  at [https://medicine-recognition-bhs5.vercel.app/](https://medicine-recognition-bhs5.vercel.app/)

## Usage

- **Login** with your admin credentials.
- **Dashboard**: View real-time statistics and recent events.
- **Events**: Click on any event to see detailed analysis and AI recommendations.
- **Batch Management**: Review historical batches and their defect rates.
- **AI Suggestions**: Get actionable insights to improve production quality.

## Project Structure

- `/src/component` - React components for UI
- `/src/app/api` - API routes for data fetching and processing
- `/public` - Static assets

## Technologies Used

- Next.js (App Router)
- React
- Tailwind CSS
- AWS S3 (for event and batch data)
- AWS bedrock
- AWS IAM
- AWS Lambda
- ICAM (for image capture and analysis)

## License

MIT

---

*For any questions, please contact the project maintainer.*