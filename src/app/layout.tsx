import type { Metadata, Viewport } from 'next';
import ErrorBoundary from '@/components/ErrorBoundary';
import './globals.css';
export const viewport: Viewport = { themeColor:'#101923',width:'device-width',initialScale:1,maximumScale:5,colorScheme:'dark' };
export const metadata: Metadata = {title:'World Portal · OrPaynter Overlay',description:'An open-source world interface connecting public signals, captured evidence, company work and AI analysis.',robots:{index:false,follow:false},manifest:'/manifest.json',icons:{icon:'/brand/world-portal-32.png',apple:'/brand/world-portal-180.png'}};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body className="antialiased"><ErrorBoundary name="OrPaynter Overlay">{children}</ErrorBoundary></body></html>;}
