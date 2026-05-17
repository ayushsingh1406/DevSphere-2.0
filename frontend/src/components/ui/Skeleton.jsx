function Skeleton({
  className = "",
}) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-white/[0.07] ${className}`}
    />
  );
}

export default Skeleton;
