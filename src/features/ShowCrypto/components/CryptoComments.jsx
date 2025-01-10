import { RiSendPlaneFill, RiEditLine, RiDeleteBinLine } from 'react-icons/ri';

const CryptoComments = ({ comments, newComment, setNewComment, handleAddComment, handleEditComment, handleDeleteComment, activeUser, formatDate }) => {
  return (
    <div className="p-8 space-y-8">
      <div className="text-xl font-medium text-white mb-4">Comments</div>

      <form onSubmit={handleAddComment} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-gray/50 rounded-lg py-2 px-4 text-white placeholder-gray-light focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="bg-primary hover:bg-primary/90 text-background px-4 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RiSendPlaneFill />
          Send
        </button>
      </form>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-gray-light text-center py-8">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray/20 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm text-gray-light">
                  <span className="font-bold">{comment.username}</span> | {formatDate(comment.timestamp)}
                </div>
                <div className="text-sm text-gray-light">
                  Price: ${comment.cryptoPrice.toLocaleString()}
                </div>
              </div>
              <div className="text-white mb-4">{comment.text}</div>
              {comment.userId === activeUser?.id && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const newText = prompt('Edit your comment:', comment.text);
                      if (newText) handleEditComment(comment.id, newText);
                    }}
                    className="text-blue-500 hover:underline"
                  >
                    <RiEditLine size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-500 hover:underline"
                  >
                    <RiDeleteBinLine size={20} />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CryptoComments;
