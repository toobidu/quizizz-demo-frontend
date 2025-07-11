import { useTheme } from '../contexts/ThemeContext';
import '../style/components/ThemeDemo.css';

function ThemeDemo() {
  const { darkMode, theme, colors } = useTheme();

  return (
    <div className="theme-demo">
      <h2>Demo Theme</h2>
      <div className="theme-info">
        <p>Chế độ hiện tại: <strong>{darkMode ? 'Tối' : 'Sáng'}</strong></p>
        <p>Tên theme: <strong>{theme}</strong></p>
      </div>

      <div className="color-samples">
        <div className="color-sample" style={{ backgroundColor: 'var(--bg-color)' }}>
          <span>Background</span>
        </div>
        <div className="color-sample" style={{ backgroundColor: 'var(--text-color)', color: 'var(--bg-color)' }}>
          <span>Text</span>
        </div>
        <div className="color-sample" style={{ backgroundColor: 'var(--btn-primary-bg)', color: 'var(--btn-primary-text)' }}>
          <span>Primary</span>
        </div>
        <div className="color-sample" style={{ backgroundColor: 'var(--btn-secondary-bg)', color: 'var(--btn-secondary-text)' }}>
          <span>Secondary</span>
        </div>
      </div>

      <div className="ui-samples">
        <button className="btn-primary">Button Primary</button>
        <button className="btn-secondary">Button Secondary</button>
        <input type="text" placeholder="Input field" />
        <div className="card-sample">
          <h3>Card Example</h3>
          <p>This is a sample card with theme variables applied.</p>
        </div>
      </div>
    </div>
  );
}

export default ThemeDemo;