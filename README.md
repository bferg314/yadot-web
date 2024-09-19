
# **Yadot-Web**

Yadot-Web is a simple Next.js app that calculates and displays how long you have been alive in days, weeks, and years based on your date of birth. The app auto-updates daily and is fully containerized using Docker for easy deployment.

## **Features**

- Displays today's date.
- Shows how long you have been alive in:
  - Total days
  - Weeks with partial weeks displayed as decimals
  - Years with partial years displayed as days
- Supports leap years.
- Responsive design using Tailwind CSS.
- Hover over any of the "You have been alive for" section to reveal the date of birth.
- Built for `amd64` and `arm64` architectures.

## **Getting Started**

### **Prerequisites**

- Node.js (version 18 or higher)
- Docker (with Docker Buildx enabled)
- Docker Hub account (username: `bferg314`)
- Unraid server (optional, for deployment)

### **Installation**

1. Clone the repository:

```bash
git clone https://github.com/bferg314/yadot-web.git
cd yadot-web
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the project root and add your date of birth as an environment variable:

```bash
NEXT_PUBLIC_REFERENCE_DATE=1979-09-11  # Example date
```

### **Running Locally**

To start the app locally:

```bash
npm run dev
```

Visit `http://localhost:3000` to view the app in your browser.

### **Building the Docker Image**

To build a multi-architecture Docker image:

1. Enable Docker Buildx:

```bash
docker buildx create --use
```

2. Build the image for `amd64` and `arm64` platforms:

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t bferg314/yadot-web:latest --push .
```

3. Verify the build by running the container locally:

```bash
docker run -p 3000:3000 bferg314/yadot-web:latest
```

### **Deploying on Unraid**

1. Go to the **Docker** tab in Unraid.
2. Click **Add Container**.
3. Set the repository to `bferg314/yadot-web:latest`.
4. Map port `3000` on the host to port `3000` in the container.
5. Apply and start the container.

Your app will be available at `http://<Unraid-IP>:3000`.

## **Development Notes**

- The app automatically refreshes daily using `setInterval` to check for the date every 10 minutes.
- Error handling is built in for cases where the date of birth (`NEXT_PUBLIC_REFERENCE_DATE`) is not set.
- Semantic HTML and ARIA labels are used to improve accessibility.
- Supports localization (default: English). You can change the locale by importing a different `dayjs` locale.

## **Future Enhancements**

- Add unit testing with Jest or React Testing Library.
- Expand localization support for different languages.
