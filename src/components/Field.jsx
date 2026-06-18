function Field({ label, children, full = false }) {
  return (
    <label className={full ? 'field full-row' : 'field'}>
      <span>{label}</span>
      {children}
    </label>
  );
}

export default Field;