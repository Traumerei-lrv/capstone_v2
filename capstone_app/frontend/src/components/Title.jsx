export default function Title({
  children,
  font = 'Ari',
  style,
  ...props
}) {
  return (
    <h1
      style={{
        fontFamily: font,
        ...style,
      }}
      {...props}
    >
      {children}
    </h1>
  );
}