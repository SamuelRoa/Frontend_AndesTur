export function Logo({ className = "", size = 40 }) {
  return (
    <img
      src="/Logo_andestur.png"
      alt="Logo AndesTur"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain", display: "block" }}
    />
  );
}
