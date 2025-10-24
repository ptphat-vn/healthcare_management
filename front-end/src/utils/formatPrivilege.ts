export default function formatPrivilege(priv: string) {
  return priv
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
