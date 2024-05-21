export const StrikeThroughMaybe = ({ add, children }) => {
    if (!add) return children;

    return <s>{children}</s>
}