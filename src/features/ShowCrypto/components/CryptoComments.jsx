import { RiSendPlaneFill, RiEditLine, RiDeleteBinLine, RiThumbUpLine, RiThumbUpFill, RiArrowUpLine, RiArrowUpFill, RiArrowDownLine, RiArrowDownFill } from 'react-icons/ri';

const CryptoComments = ({ 
  comments, 
  newComment, 
  setNewComment, 
  handleAddComment, 
  handleEditComment, 
  handleDeleteComment, 
  handleLikeComment,
  handleVoteComment,
  activeUser, 
  formatDate 
}) => {
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
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    className="text-gray-light hover:text-primary transition-colors"
                    disabled={!activeUser}
                  >
                    {comment.likes?.includes(activeUser?.id) ? (
                      <RiThumbUpFill size={20} className="text-primary" />
                    ) : (
                      <RiThumbUpLine size={20} />
                    )}
                  </button>
                  <span className="text-sm text-gray-light">{comment.likes?.length || 0}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVoteComment(comment.id, 'up')}
                    className="text-gray-light hover:text-green-500 transition-colors"
                    disabled={!activeUser}
                  >
                    {comment.votes?.find(v => v.userId === activeUser?.id)?.type === 'up' ? (
                      <RiArrowUpFill size={20} className="text-green-500" />
                    ) : (
                      <RiArrowUpLine size={20} />
                    )}
                  </button>
                  <span className="text-sm text-gray-light">
                    {comment.votes?.reduce((acc, vote) => acc + (vote.type === 'up' ? 1 : -1), 0) || 0}
                  </span>
                  <button
                    onClick={() => handleVoteComment(comment.id, 'down')}
                    className="text-gray-light hover:text-red-500 transition-colors"
                    disabled={!activeUser}
                  >
                    {comment.votes?.find(v => v.userId === activeUser?.id)?.type === 'down' ? (
                      <RiArrowDownFill size={20} className="text-red-500" />
                    ) : (
                      <RiArrowDownLine size={20} />
                    )}
                  </button>
                </div>

                {comment.userId === activeUser?.id && (
                  <div className="flex gap-2 ml-auto">
                    <button
                      onClick={() => {
                        const newText = prompt('Edit your comment:', comment.text);
                        if (newText) handleEditComment(comment.id, newText);
                      }}
                      className="text-blue-500 hover:text-blue-400 transition-colors"
                    >
                      <RiEditLine size={20} />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-500 hover:text-red-400 transition-colors"
                    >
                      <RiDeleteBinLine size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CryptoComments;
