import { useRecoilState } from 'recoil';

import { Loading } from './component/Loading';
import { docDataState } from './recoil';

function App() {
  const state = useRecoilState(docDataState);

  return <>{!state && <Loading />}</>;
}

export default App;
