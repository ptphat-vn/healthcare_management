import { ArrowLeft } from "lucide-react";

import { useNavigate } from "react-router-dom";
interface ButtonBackProps {
  title: string;
  style?: string;
}
export default function ButtonBack({ title, style }: ButtonBackProps) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className={`btn-back ${style}`}
    >
      <ArrowLeft className="h-4 w-4" />
      Back to {title}
    </button>
  );
}
