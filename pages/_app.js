import Script from 'next/script'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  <Script type="text/javascript" src="dist/jszip-utils.js"/>
  return <Component {...pageProps} />
}

export default MyApp
