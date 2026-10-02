import type { Metadata, Viewport } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import './globals.css';
export const viewport: Viewport = { themeColor:'#101923',width:'device-width',initialScale:1,maximumScale:5,colorScheme:'dark' };
export const metadata: Metadata = {title:'OrPaynter Overlay · A connected digital world',description:'An open-source world interface connecting public signals, captured evidence, company work and AI analysis.',robots:{index:false,follow:false},manifest:'/manifest.json',icons:{icon:'/brand/orpaynter-32.png',apple:'/brand/orpaynter-180.png'}};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body className="antialiased"><ErrorBoundary name="OrPaynter Overlay">{children}</ErrorBoundary></body></html>;}
