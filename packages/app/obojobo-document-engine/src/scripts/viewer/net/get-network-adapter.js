import OfflineAdapter from './adapters/offline-adapter'
import OnlineAdapter from './adapters/online-adapter'

export default ({ isOffline }) => {
	if (isOffline) {
		return new OfflineAdapter()
	} else {
		return new OnlineAdapter()
	}
}
