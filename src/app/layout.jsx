import '../index.css'
import '../App.css'
import '../premium.css'

export const metadata = {
  title: 'Xopan',
  description: 'Explore crop rotations and historical climate for fields in Nuevo León.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
