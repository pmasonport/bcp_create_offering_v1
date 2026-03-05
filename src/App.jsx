import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Topbar from './components/Topbar'
import Sidebar from './components/Sidebar'
import Drawer from './components/Drawer'
import ScrollToTop from './components/ScrollToTop'
import OfferingsIndex from './pages/OfferingsIndex'
import GroupDetail from './pages/GroupDetail'
import OfferingDetail from './pages/OfferingDetail'
import FeaturesIndex from './pages/FeaturesIndex'
import ServiceDetail from './pages/ServiceDetail'
import MetersIndex from './pages/MetersIndex'
import CreateOfferingWizard from './pages/CreateOfferingWizard'

function App() {
  const [environment, setEnvironment] = useState('staging')
  const [drawerContent, setDrawerContent] = useState(null)

  const closeDrawer = () => setDrawerContent(null)

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar />
      <div className="flex flex-1 pt-12">
        <Sidebar
          environment={environment}
          onEnvironmentChange={setEnvironment}
        />
        <main className="flex-1 ml-[200px] bg-g-50 min-h-screen">
          <div className="max-w-[960px] px-10 py-12 pb-40">
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<OfferingsIndex />} />
              <Route path="/offerings" element={<OfferingsIndex />} />
              <Route path="/offerings/group/:groupId" element={<GroupDetail />} />
              <Route path="/offerings/:offeringId" element={<OfferingDetail onOpenDrawer={setDrawerContent} />} />
              <Route path="/features" element={<FeaturesIndex />} />
              <Route path="/features/:serviceId" element={<ServiceDetail onOpenDrawer={setDrawerContent} />} />
              <Route path="/meters" element={<MetersIndex onOpenDrawer={setDrawerContent} />} />
              <Route path="/create/offering" element={<CreateOfferingWizard />} />
              <Route path="/create/addon" element={<CreateOfferingWizard isAddon />} />
            </Routes>
          </div>
        </main>
      </div>
      {drawerContent && <Drawer content={drawerContent} onClose={closeDrawer} />}
    </div>
  )
}

export default App
