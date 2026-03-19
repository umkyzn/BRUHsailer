import { useGuide } from '../../context/GuideContext';

export default function Toast() {
  const { state } = useGuide();

  return (
    <div className={`save-toast${state.toast ? ' show' : ''}`}>
      {state.toast ?? 'Progress saved'}
    </div>
  );
}
