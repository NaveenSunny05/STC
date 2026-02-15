import CommitteeChat from '../components/CommitteeChat'

export default function CommitteeChatPage({ user }) {
    return (
        <div className="pt-20 px-4 max-w-7xl mx-auto h-screen">
            <CommitteeChat user={user} isFullPage={true} />
        </div>
    )
}
