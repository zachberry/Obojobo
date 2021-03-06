import getDisplayFriendlyScore from './get-display-friendly-score'

let getReportDetailsForAttempt = (scoreInfo, totalNumberOfAttemptsAllowed) => {
	return {
		attemptNum: '' + scoreInfo.attemptNumber,
		attemptScore: getDisplayFriendlyScore(scoreInfo.attemptScore),
		assessScore:
			scoreInfo.assessmentModdedScore === null
				? 'Did Not Pass'
				: getDisplayFriendlyScore(scoreInfo.assessmentModdedScore),
		totalNumberOfAttemptsAllowed: '' + totalNumberOfAttemptsAllowed
	}
}

export default getReportDetailsForAttempt
