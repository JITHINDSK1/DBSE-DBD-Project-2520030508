import { ArrowRight } from 'lucide-react';
import './FlowButton.css';

export function FlowButton({ text = "Modern Button", onClick, className = "", style = {} }) {
  return (
    <button className={`flow-button ${className}`} onClick={onClick} style={style}>
      <ArrowRight className="flow-button-arrow left-arrow" />
      <span className="flow-button-text">{text}</span>
      <span className="flow-button-circle"></span>
      <ArrowRight className="flow-button-arrow right-arrow" />
    </button>
  );
}
