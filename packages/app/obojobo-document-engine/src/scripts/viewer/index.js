import getNetworkAdapter from './net/get-network-adapter'
import NetworkAdapter from './net/adapters/network-adapter'
import OfflineAdapter from './net/adapters/offline-adapter'
import OnlineAdapter from './net/adapters/online-adapter'
import AssessmentScoreReportView from './assessment/assessment-score-report-view'
import AssessmentScoreReporter from './assessment/assessment-score-reporter'
import AssessmentStore from './stores/assessment-store'
import AssessmentUtil from './util/assessment-util'
import FocusStore from './stores/focus-store'
import FocusUtil from './util/focus-util'
import Header from './components/header'
import LTINetworkStates from './stores/assessment-store/lti-network-states'
import LTIResyncStates from './stores/assessment-store/lti-resync-states'
import Logo from './components/logo'
import MediaStore from './stores/media-store'
import MediaUtil from './util/media-util'
import NavStore from './stores/nav-store'
import NavUtil from './util/nav-util'
import OboComponent from './components/obo-component'
import QuestionStore from './stores/question-store'
import QuestionUtil from './util/question-util'
import ViewerApp from './components/viewer-app'
import getLTIOutcomeServiceHostname from './util/get-lti-outcome-service-hostname'

export default {
	components: {
		ViewerApp,
		Logo,
		Header,
		OboComponent
	},

	stores: {
		AssessmentStore,
		assessmentStore: {
			LTINetworkStates,
			LTIResyncStates
		},
		NavStore,
		MediaStore,
		QuestionStore,
		FocusStore
	},

	util: {
		AssessmentUtil,
		NavUtil,
		MediaUtil,
		QuestionUtil,
		FocusUtil,
		getLTIOutcomeServiceHostname
	},

	assessment: {
		AssessmentScoreReporter,
		AssessmentScoreReportView
	},

	net: {
		getNetworkAdapter,
		adapters: {
			NetworkAdapter,
			OfflineAdapter,
			OnlineAdapter
		}
	}
}
