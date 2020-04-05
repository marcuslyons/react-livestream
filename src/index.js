import React from 'react'
import PropTypes from 'prop-types'

import './index.css'

const MIXER_API_URL = 'https://mixer.com/api/v1/channels/'
const TWITCH_API_URL = 'https://api.twitch.tv/helix/streams?user_login='

function ReactLivestream(props) {
  const {
    twitchClientId,
    mixerChannelId,
    offlineComponent,
    platform,
    twitchUserName,
    youtubeChannelId,
    youtubeApiKey
  } = props

  const [isLive, setIsLive] = React.useState(false)
  const [youtubeVideoId, setYoutubeVideoId] = React.useState(null)

  function fetchTwitchData() {
    fetch(`${TWITCH_API_URL}${twitchUserName}`, {
      headers: {
        'Client-ID': twitchClientId
      }
    })
      .then(async res => {
        const response = await res.json()
        const streamInfo = Boolean(response.data && response.data[0])
        if (streamInfo) {
          setIsLive(true)
        }
      })
      .catch(err => {
        console.log('Error fetching data from Twitch API: ', err)
      })
  }

  function fetchMixerData() {
    fetch(`${MIXER_API_URL}${mixerChannelId}/broadcast`)
      .then(async res => {
        const response = await res.json()
        const { channelId, online } = response

        if (channelId === mixerChannelId && online) {
          setIsLive(true)
        }
      })
      .catch(err => {
        console.log('Error fetching data from Mixer API: ', err)
      })
  }

  function fetchYoutubeData() {
    fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${youtubeChannelId}&eventType=live&type=video&key=${youtubeApiKey}`,
      {
        headers: {
          Accept: 'application/json'
        }
      }
    )
      .then(async res => {
        const response = await res.json()

        if (response.items && response.items.length > 1) {
          const streamInfo = response.items[0]
          setIsLive(true)
          setYoutubeVideoId(streamInfo.id.videoId)
        }
      })
      .catch(err => {
        console.log('Error fetching data from YouTube API: ', err)
      })
  }

  function processMixerStream() {
    if (mixerChannelId) {
      fetchMixerData()
    } else {
      console.error(
        '[react-livestream] Mixer support requires a mixerChannelId prop'
      )
    }
  }

  function processTwitchStream() {
    if (twitchClientId && twitchUserName) {
      fetchTwitchData()
    } else {
      console.error(
        '[react-livestream] Twitch support requires a twitchClientId and twitchUserName prop'
      )
    }
  }

  function processYoutubeStream() {
    if (youtubeChannelId && youtubeApiKey) {
      fetchYoutubeData()
    } else {
      console.error(
        '[react-livestream] YouTube support requires a youtubeApiKey and youtubeChannelId prop'
      )
    }
  }

  function embedIframe() {
    switch (platform) {
      case 'mixer':
        return (
          <iframe
            className="ReactLivestream__iframe"
            i18n-title="channel#ShareDialog:playerEmbedFrame|Embed player Frame copied from share dialog"
            allowFullScreen="true"
            src={`https://mixer.com/embed/player/${mixerChannelId}?disableLowLatency=1`}
          ></iframe>
        )
      case 'twitch':
        return (
          <iframe
            className="ReactLivestream__iframe"
            allowFullScreen
            src={`https://player.twitch.tv/?channel=${twitchUserName}`}
            frameBorder="0"
          ></iframe>
        )
      case 'youtube':
        return (
          <iframe
            className="ReactLivestream__iframe"
            src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1`}
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        )
    }
  }

  React.useEffect(() => {
    switch (platform) {
      case 'mixer':
        processMixerStream()
        break
      case 'twitch':
        processTwitchStream()
        break
      case 'youtube':
        processYoutubeStream()
        break
      default:
        console.error(
          '[react-livestream] Platform prop is required for this package to work 🤘'
        )
        break
    }
  }, [])

  return isLive ? (
    <div className="ReactLivestream">{embedIframe()}</div>
  ) : offlineComponent ? (
    offlineComponent
  ) : null
}

export default ReactLivestream

ReactLivestream.propTypes = {
  mixerChannelId: PropTypes.number,
  offlineComponent: PropTypes.element,
  platform: PropTypes.string.isRequired,
  twitchClientId: PropTypes.string,
  twitchUserName: PropTypes.string,
  youtubeChannelId: PropTypes.string,
  youtubeApiKey: PropTypes.string
}

ReactLivestream.defaultProps = {
  mixerChannelId: null,
  offlineComponent: null,
  twitchClientId: null,
  twitchUserName: null,
  youtubeChannelId: null,
  youtubeApiKey: null
}
