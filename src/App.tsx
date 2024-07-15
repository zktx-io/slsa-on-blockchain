import { RecoilRoot, useRecoilState } from 'recoil';

import { Loading } from './component/Loading';
import { docDataState } from './recoil';

function App() {
  const state = useRecoilState(docDataState);

  return <RecoilRoot>{!state && <Loading />}</RecoilRoot>;
}

export default App;
