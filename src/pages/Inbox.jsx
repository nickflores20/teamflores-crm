import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import InboxConversationList from '../components/inbox/InboxConversationList.jsx'
import InboxThread from '../components/inbox/InboxThread.jsx'

const MOCK_CONVERSATIONS = [
  {
    id: 1, leadId: 2, name: "Maria Garcia", initials: "MG",
    preview: "Hi Nick, thanks for reaching out! I'm very interested...",
    time: "2m ago", stage: "Contacted", source: "LeadPops NV",
    unread: true, type: "text", folder: "Inbox",
    messages: [
      { dir: "out", type: "text", body: "Hi Maria! This is Nick Flores from Team Flores. Just wanted to follow up on my email. Would love to chat about your home purchase options. Call me at (702) 497-6370 or just reply here!", time: "Mar 27 9:15 AM", template: "LeadPops NV Purchase" },
      { dir: "in", type: "text", body: "Hi Nick, thanks for reaching out! I'm very interested in learning more about my options. I've been looking at homes in the 89117 area.", time: "Mar 27 9:42 AM" },
      { dir: "out", type: "text", body: "That's great Maria! The 89117 area has some beautiful homes. With your profile I think we can get you a great rate. Do you have time for a quick 15-min call this week?", time: "Mar 27 10:05 AM" },
      { dir: "in", type: "text", body: "Yes! I'm free Thursday or Friday afternoon. What works for you?", time: "Mar 27 2:30 PM" }
    ]
  },
  {
    id: 2, leadId: 3, name: "James Wilson", initials: "JW",
    preview: "Sounds great! I'll get those documents to you by Friday.",
    time: "1h ago", stage: "Qualified", source: "Zillow",
    unread: true, type: "email", folder: "Inbox",
    messages: [
      { dir: "out", type: "email", subject: "Your VA Loan Options — Nick Flores", body: "Hi James,\n\nThank you for reaching out about your VA loan! As a veteran I want to make sure you get every benefit you've earned.\n\nWith your credit score and service record, I believe we can get you into a home with $0 down. Let me know when you're available for a quick call.\n\nNicholas Flores\nDivision Director | Sunnyhill Financial\nNMLS #422150", time: "Mar 26 8:00 AM" },
      { dir: "in", type: "email", subject: "Re: Your VA Loan Options", body: "Hi Nick,\n\nThis looks great! I had no idea I could do $0 down. I'm very interested in moving forward.\n\nSounds great! I'll get those documents to you by Friday.\n\nJames", time: "Mar 27 11:30 AM" }
    ]
  },
  {
    id: 3, leadId: 5, name: "Robert Martinez", initials: "RM",
    preview: "New lead — inquiry submitted via Bankrate TX",
    time: "3h ago", stage: "New", source: "Bankrate TX",
    unread: true, type: "text", folder: "Inbox",
    messages: [
      { dir: "system", type: "activity", body: "Robert Martinez submitted a new inquiry via Bankrate TX Purchase", time: "Mar 28 9:15 AM" }
    ]
  },
  {
    id: 4, leadId: 4, name: "Sarah Johnson", initials: "SJ",
    preview: "LOAN FUNDED! Congratulations on your refinance!",
    time: "Mar 14", stage: "Closed Won", source: "Bankrate NV",
    unread: false, type: "email", folder: "Closed",
    messages: [
      { dir: "out", type: "email", subject: "Congratulations on Your Refinance!", body: "Hi Sarah,\n\nI'm thrilled to share that your refinance loan has been officially funded!\n\nYou're now saving $415/month with your new rate. Thank you for trusting Team Flores with this important financial decision.\n\nNicholas Flores", time: "Mar 14 3:00 PM" },
      { dir: "in", type: "email", subject: "Re: Congratulations!", body: "Nick, thank you so much! You made this process so easy. I already referred two of my coworkers to you!", time: "Mar 14 4:30 PM" }
    ]
  },
  {
    id: 5, leadId: 8, name: "Carlos Martinez", initials: "CM",
    preview: "Auto-sequence Day 3 text sent",
    time: "Mar 28 8:55 AM", stage: "Cold", source: "LeadPops NV",
    unread: false, type: "text", folder: "Sent",
    messages: [
      { dir: "out", type: "text", body: "Hi Carlos! This is Nick from Team Flores. I noticed you were looking into home financing a few days ago. I'd love to help — even if the timing wasn't right before, let's chat about your options. (702) 497-6370", time: "Mar 25 9:00 AM", template: "Cold Sequence Day 0" },
      { dir: "out", type: "text", body: "Hi Carlos, just following up! Rates have been moving — I want to make sure you have the latest info. Worth a 10-min call? Reply STOP to opt out.", time: "Mar 28 8:55 AM", template: "Cold Sequence Day 3" }
    ]
  },
  {
    id: 6, leadId: 9, name: "Jennifer Lee", initials: "JL",
    preview: "I'll think about it and get back to you",
    time: "Mar 26", stage: "Active", source: "Zillow",
    unread: false, type: "text", folder: "Inbox",
    messages: [
      { dir: "out", type: "text", body: "Hi Jennifer! Nick Flores here from Team Flores. Loved chatting with you yesterday about your purchase plans in NV. Ready to start the pre-approval when you are!", time: "Mar 25 2:00 PM" },
      { dir: "in", type: "text", body: "I'll think about it and get back to you next week.", time: "Mar 26 10:15 AM" }
    ]
  },
  {
    id: 7, leadId: 11, name: "David Kim", initials: "DK",
    preview: "Auto-sequence Day 7 text sent",
    time: "Mar 28 7:45 AM", stage: "Cold", source: "Website",
    unread: false, type: "text", folder: "Sent",
    messages: [
      { dir: "out", type: "text", body: "Hi David! Nick Flores from Team Flores here. You filled out a form on our site about a week ago. I want to make sure you have what you need. Happy to answer any questions — no pressure!", time: "Mar 21 9:00 AM", template: "Cold Sequence Day 0" },
      { dir: "out", type: "text", body: "Hi David, checking in again! I have a few loan scenarios that might work really well for your situation. Got 10 minutes this week? Call/text (702) 497-6370.", time: "Mar 28 7:45 AM", template: "Cold Sequence Day 7" }
    ]
  },
  {
    id: 8, leadId: 6, name: "Lisa Thompson", initials: "LT",
    preview: "Thank you for the pre-approval letter!",
    time: "Mar 22", stage: "Active", source: "LeadPops AZ",
    unread: false, type: "email", folder: "Inbox",
    messages: [
      { dir: "out", type: "email", subject: "Your Pre-Approval Letter is Ready!", body: "Hi Lisa,\n\nGreat news! Your pre-approval letter is ready. You're approved for up to $350,000 with excellent terms.\n\nThis letter is valid for 90 days. Let's find your dream home!\n\nNicholas Flores", time: "Mar 21 3:00 PM" },
      { dir: "in", type: "email", subject: "Re: Pre-Approval Letter", body: "Thank you for the pre-approval letter! My realtor is very impressed with the quick turnaround. We're looking at a few properties this weekend.", time: "Mar 22 9:15 AM" }
    ]
  },
  {
    id: 9, leadId: 14, name: "Michael Torres", initials: "MT",
    preview: "Missed your call — can we reschedule?",
    time: "Mar 27", stage: "Active", source: "LeadPops NV",
    unread: true, type: "text", folder: "Inbox",
    messages: [
      { dir: "out", type: "text", body: "Hi Michael! Nick Flores here. I tried calling you earlier about your home purchase — missed you! When's a good time to connect?", time: "Mar 27 2:00 PM" },
      { dir: "in", type: "text", body: "Missed your call — can we reschedule? I'm free tomorrow after 3pm.", time: "Mar 27 5:30 PM" }
    ]
  },
  {
    id: 10, leadId: 16, name: "Amanda Foster", initials: "AF",
    preview: "New lead — inquiry submitted via Bankrate NV",
    time: "Mar 27", stage: "New", source: "Bankrate NV",
    unread: false, type: "text", folder: "Inbox",
    messages: [
      { dir: "system", type: "activity", body: "Amanda Foster submitted a new inquiry via Bankrate NV Purchase", time: "Mar 27 4:30 PM" },
      { dir: "out", type: "text", body: "Hi Amanda! This is Nick Flores from Team Flores. I saw your inquiry about home financing in Nevada. I'd love to help you explore your options! Call me at (702) 497-6370.", time: "Mar 27 4:45 PM", template: "Bankrate NV Purchase" }
    ]
  }
]

export default function Inbox() {
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS)
  const [selectedId, setSelectedId] = useState(null)
  const [activeFolder, setActiveFolder] = useState('Inbox')

  const unreadCount = conversations.filter(c => c.unread && c.folder === 'Inbox').length
  const selectedConversation = conversations.find(c => c.id === selectedId) || null

  const handleSelect = (id) => {
    setSelectedId(id)
    // Mark as read
    setConversations(prev =>
      prev.map(c => c.id === id ? { ...c, unread: false } : c)
    )
  }

  const handleFolderChange = (folder) => {
    setActiveFolder(folder)
    setSelectedId(null)
  }

  const handleSendReply = (convId, newMsg, andClose) => {
    setConversations(prev =>
      prev.map(c => {
        if (c.id !== convId) return c
        return {
          ...c,
          messages: [...c.messages, newMsg],
          preview: newMsg.body?.slice(0, 60) || newMsg.subject || '',
          time: 'Just now',
          folder: andClose ? 'Closed' : c.folder,
        }
      })
    )
    if (andClose) {
      setSelectedId(null)
    }
  }

  const handleClose = (convId) => {
    setConversations(prev =>
      prev.map(c => c.id === convId ? { ...c, folder: 'Closed' } : c)
    )
    setSelectedId(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      className="flex h-full overflow-hidden"
      style={{ backgroundColor: '#F8FAFC' }}
    >
      <InboxConversationList
        conversations={conversations}
        selectedId={selectedId}
        onSelect={handleSelect}
        activeFolder={activeFolder}
        onFolderChange={handleFolderChange}
      />
      <InboxThread
        conversation={selectedConversation}
        onSendReply={handleSendReply}
        onClose={handleClose}
      />
    </motion.div>
  )
}
