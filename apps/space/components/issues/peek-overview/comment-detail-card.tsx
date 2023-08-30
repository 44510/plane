import React, { useEffect, useState, useRef } from "react";

// react-hook-form
import { useForm } from "react-hook-form";

// mobx
import { observer } from "mobx-react-lite";
import { useMobxStore } from "lib/mobx/store-provider";

// headless ui
import { Menu, Transition } from "@headlessui/react";

// icons
import { ChatBubbleLeftEllipsisIcon, CheckIcon, XMarkIcon, EllipsisVerticalIcon } from "@heroicons/react/24/outline";

// helpers
import { timeAgo } from "helpers/date-time.helper";
// types
import { Comment } from "store/types";
import Tiptap, { ITiptapRichTextEditor } from "components/tiptap";

const TiptapEditor = React.forwardRef<ITiptapRichTextEditor, ITiptapRichTextEditor>((props, ref) => (
  <Tiptap {...props} forwardedRef={ref} />
));

TiptapEditor.displayName = "TiptapEditor";

type Props = {
  workspaceSlug: string;
  comment: Comment;
};

export const CommentCard: React.FC<Props> = observer((props) => {
  const { comment, workspaceSlug } = props;

  const { user: userStore, issue: issueStore } = useMobxStore();

  const editorRef = useRef<any>(null);
  const showEditorRef = useRef<any>(null);

  const [isEditing, setIsEditing] = useState(false);

  const {
    formState: { isSubmitting },
    handleSubmit,
    setFocus,
    watch,
    setValue,
  } = useForm<Comment>({
    defaultValues: comment,
  });

  const handleDelete = async () => {
    if (!workspaceSlug || !issueStore.activePeekOverviewIssueId) return;

    await issueStore.deleteIssueCommentAsync(
      workspaceSlug,
      comment.project,
      issueStore.activePeekOverviewIssueId,
      comment.id
    );
  };

  const handleCommentUpdate = async (formData: Comment) => {
    if (!workspaceSlug || !issueStore.activePeekOverviewIssueId) return;

    const response = await issueStore.updateIssueCommentAsync(
      workspaceSlug,
      comment.project,
      issueStore.activePeekOverviewIssueId,
      comment.id,
      formData
    );

    if (response) {
      editorRef.current?.setEditorValue(response.comment_html);
      showEditorRef.current?.setEditorValue(response.comment_html);
    }

    setIsEditing(false);
  };

  useEffect(() => {
    isEditing && setFocus("comment_html");
  }, [isEditing, setFocus]);

  return (
    <div className="relative flex items-start space-x-3">
      <div className="relative px-1">
        {comment.actor_detail.avatar && comment.actor_detail.avatar !== "" ? (
          <img
            src={comment.actor_detail.avatar}
            alt={
              comment.actor_detail.is_bot ? comment.actor_detail.first_name + " Bot" : comment.actor_detail.display_name
            }
            height={30}
            width={30}
            className="grid h-7 w-7 place-items-center rounded-full border-2 border-custom-border-200"
          />
        ) : (
          <div className={`grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-gray-500 text-white`}>
            {comment.actor_detail.is_bot
              ? comment.actor_detail.first_name.charAt(0)
              : comment.actor_detail.display_name.charAt(0)}
          </div>
        )}

        <span className="absolute -bottom-0.5 -right-1 rounded-tl bg-custom-background-80 px-0.5 py-px">
          <ChatBubbleLeftEllipsisIcon className="h-3.5 w-3.5 text-custom-text-200" aria-hidden="true" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div>
          <div className="text-xs">
            {comment.actor_detail.is_bot ? comment.actor_detail.first_name + " Bot" : comment.actor_detail.display_name}
          </div>
          <p className="mt-0.5 text-xs text-custom-text-200">
            <>Commented {timeAgo(comment.created_at)}</>
          </p>
        </div>
        <div className="issue-comments-section p-0">
          <form
            onSubmit={handleSubmit(handleCommentUpdate)}
            className={`flex-col gap-2 ${isEditing ? "flex" : "hidden"}`}
          >
            <div>
              <TiptapEditor
                workspaceSlug={workspaceSlug as string}
                ref={editorRef}
                value={watch("comment_html")}
                debouncedUpdatesEnabled={false}
                customClassName="min-h-[50px] p-3 shadow-sm"
                onChange={(comment_json: Object, comment_html: string) => {
                  setValue("comment_json", comment_json);
                  setValue("comment_html", comment_html);
                }}
              />
            </div>
            <div className="flex gap-1 self-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group rounded border border-green-500 bg-green-500/20 p-2 shadow-md duration-300 hover:bg-green-500"
              >
                <CheckIcon className="h-3 w-3 text-green-500 duration-300 group-hover:text-white" />
              </button>
              <button
                type="button"
                className="group rounded border border-red-500 bg-red-500/20 p-2 shadow-md duration-300 hover:bg-red-500"
                onClick={() => setIsEditing(false)}
              >
                <XMarkIcon className="h-3 w-3 text-red-500 duration-300 group-hover:text-white" />
              </button>
            </div>
          </form>
          <div className={`${isEditing ? "hidden" : ""}`}>
            <TiptapEditor
              workspaceSlug={workspaceSlug as string}
              ref={showEditorRef}
              value={comment.comment_html}
              editable={false}
              customClassName="text-xs border border-custom-border-200 bg-custom-background-100"
            />
          </div>
        </div>
      </div>

      {userStore?.currentUser?.id === comment?.actor_detail?.id && (
        <Menu as="div" className="relative w-min text-left">
          <Menu.Button
            type="button"
            onClick={() => {}}
            className="relative grid place-items-center rounded p-1 text-custom-text-200 hover:text-custom-text-100 outline-none cursor-pointer hover:bg-custom-background-80"
          >
            <EllipsisVerticalIcon className="h-5 w-5 text-custom-text-200 duration-300" />
          </Menu.Button>

          <Transition
            as={React.Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute z-10 overflow-y-scroll whitespace-nowrap rounded-md max-h-36 border right-0 origin-top-right mt-1 overflow-auto min-w-[8rem] border-custom-border-300 p-1 text-xs shadow-lg focus:outline-none bg-custom-background-90">
              <Menu.Item>
                {({ active }) => (
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(true);
                      }}
                      className={`w-full select-none truncate rounded px-1 py-1.5 text-left text-custom-text-200 hover:bg-custom-background-80 ${
                        active ? "bg-custom-background-80" : ""
                      }`}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        handleDelete();
                      }}
                      className={`w-full select-none truncate rounded px-1 py-1.5 text-left text-custom-text-200 hover:bg-custom-background-80 ${
                        active ? "bg-custom-background-80" : ""
                      }`}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      )}
    </div>
  );
});
