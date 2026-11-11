const logoHeight = 128;

// iOS takes the launch screen from these links when the app is added to the Home Screen
export function addIosStartupImages() {
  if ((navigator as { standalone?: boolean }).standalone !== false) {
    return;
  }

  const logo = new Image();
  logo.onload = () => {
    const width = Math.min(window.screen.width, window.screen.height);
    const height = Math.max(window.screen.width, window.screen.height);
    appendStartupImage(logo, width, height, "portrait");
    appendStartupImage(logo, height, width, "landscape");
  };
  logo.src = "/img/splash-logo.png";
}

function appendStartupImage(
  logo: HTMLImageElement,
  width: number,
  height: number,
  orientation: "portrait" | "landscape",
) {
  const scale = window.devicePixelRatio;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  const logoWidth = (logoHeight * logo.naturalWidth) / logo.naturalHeight;
  // splash-logo.png is a white mask, tinted with the text color of the current theme
  const body = getComputedStyle(document.body);
  context.scale(scale, scale);
  context.imageSmoothingQuality = "high";
  context.drawImage(
    logo,
    (width - logoWidth) / 2,
    (height - logoHeight) / 2,
    logoWidth,
    logoHeight,
  );
  context.globalCompositeOperation = "source-in";
  context.fillStyle = body.color;
  context.fillRect(0, 0, width, height);
  context.globalCompositeOperation = "destination-over";
  context.fillStyle = body.backgroundColor;
  context.fillRect(0, 0, width, height);

  const link = document.createElement("link");
  link.rel = "apple-touch-startup-image";
  link.media = `(orientation: ${orientation})`;
  link.href = canvas.toDataURL();
  document.head.appendChild(link);
}
