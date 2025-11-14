import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import IconButton from "./IconButton";

const BackButton = ({ to = -1, tooltip = "Volver" }) => {
  const navigate = useNavigate();

  return (
    <IconButton
      icon={ArrowLeft}
      onClick={() => navigate(to)}
      size="sm"
      tooltip={tooltip}
      className="m-auto border text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800"
    />
  );
};

export default BackButton;
