const SUPPORTED_FEATURES = [
  'accelerometer',
  'ambient-light-sensor',
  'autoplay',
  'camera',
  'display-capture',
  'encrypted-media',
  'fullscreen',
  'geolocation',
  'gyroscope',
  'magnetometer',
  'microphone',
  'midi',
  'payment',
  'usb',
];

export function buildPermissionsPolicyHeader() {
  const policies = SUPPORTED_FEATURES.map(feature => `${feature}=()`).join(', ');
  return policies;
}
