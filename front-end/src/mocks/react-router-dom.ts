export const useNavigate = () => jest.fn();
export const useLocation = () => ({ pathname: '/' });
export const Link = ({ to, children, ...props }: any) => (
  <a href={to} {...props}>
    {children}
  </a>
);
export const BrowserRouter = ({ children }: any) => <>{children}</>;
export const RouterProvider = ({ router }: any) => <div>Router</div>;