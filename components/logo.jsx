export function Logo({ className = "", size = 40 }) {
  return (
    <img
      src="/Logo_andestur.png"
      alt="Logo AndesTur"
      width={size}
      height={size}
      className={`${className} transition-transform duration-200 ease-out hover:scale-105`}
      style={{ objectFit: "contain", display: "block" }}
    />
  );
}
