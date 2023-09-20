import React, { useEffect, useState } from "react";

import { useRouter } from "next/router";

// mobx
import { observer } from "mobx-react-lite";
import { useMobxStore } from "lib/mobx/store-provider";
// headless ui
import { Dialog, Transition } from "@headlessui/react";
// components
import { Input, TypesDropdown, AttributeForm } from "components/custom-attributes";
// ui
import { Loader, PrimaryButton, SecondaryButton } from "components/ui";
// types
import { ICustomAttribute, TCustomAttributeTypes } from "types";
// constants
import { CUSTOM_ATTRIBUTES_LIST } from "constants/custom-attributes";
import { renderEmoji } from "helpers/emoji.helper";
import EmojiIconPicker from "components/emoji-icon-picker";

type Props = {
  objectIdToEdit?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => Promise<void>;
};

export const ObjectModal: React.FC<Props> = observer(
  ({ objectIdToEdit, isOpen, onClose, onSubmit }) => {
    const [object, setObject] = useState<Partial<ICustomAttribute>>({
      display_name: "",
      description: "",
    });
    const [isCreatingObject, setIsCreatingObject] = useState(false);
    const [isUpdatingObject, setIsUpdatingObject] = useState(false);

    const router = useRouter();
    const { workspaceSlug, projectId } = router.query;

    const { customAttributes } = useMobxStore();

    const handleClose = () => {
      onClose();

      setTimeout(() => {
        setObject({ display_name: "", description: "" });
      }, 300);
    };

    const handleCreateObject = async () => {
      if (!workspaceSlug || !projectId) return;

      setIsCreatingObject(true);

      const payload: Partial<ICustomAttribute> = {
        description: object.description ?? "",
        display_name: object.display_name ?? "",
        icon: object.icon ?? "",
        project: projectId.toString(),
        type: "entity",
      };

      await customAttributes
        .createEntity(workspaceSlug.toString(), payload)
        .then((res) => {
          setObject((prevData) => ({ ...prevData, ...res }));
          if (onSubmit) onSubmit();
        })
        .finally(() => setIsCreatingObject(false));
    };

    const handleUpdateObject = async () => {
      if (!workspaceSlug || !object || !object.id) return;

      setIsUpdatingObject(true);

      const payload: Partial<ICustomAttribute> = {
        description: object.description ?? "",
        display_name: object.display_name ?? "",
        icon: object.icon ?? "",
      };

      await customAttributes
        .updateEntity(workspaceSlug.toString(), object.id, payload)
        .finally(() => setIsUpdatingObject(false));
    };

    const handleCreateEntityAttribute = async (type: TCustomAttributeTypes) => {
      if (!workspaceSlug || !object || !object.id) return;

      const typeMetaData = CUSTOM_ATTRIBUTES_LIST[type];

      const payload: Partial<ICustomAttribute> = {
        display_name: typeMetaData.label,
        type,
        ...typeMetaData.initialPayload,
      };

      await customAttributes.createEntityAttribute(workspaceSlug.toString(), {
        ...payload,
        parent: object.id,
      });
    };

    // fetch the object details if object state has id
    useEffect(() => {
      if (!object.id || object.id === "") return;

      if (!customAttributes.entityAttributes[object.id]) {
        if (!workspaceSlug) return;

        customAttributes.fetchEntityDetails(workspaceSlug.toString(), object.id).then((res) => {
          setObject({ ...res });
        });
      }
    }, [customAttributes, object.id, workspaceSlug]);

    // update the object state if objectIdToEdit is present
    useEffect(() => {
      if (!objectIdToEdit) return;

      setObject((prevData) => ({
        ...prevData,
        id: objectIdToEdit,
      }));
    }, [objectIdToEdit]);

    return (
      <Transition.Root show={isOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-20" onClose={handleClose}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-custom-backdrop bg-opacity-50 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 h-full w-full z-20">
            <div className="flex items-center justify-center h-full w-full p-4 sm:p-0">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="bg-custom-background-100 w-1/2 max-h-[85%] flex flex-col rounded-xl">
                  <h3 className="text-2xl font-semibold px-6 pt-5">New Object</h3>
                  <div className="mt-5 space-y-5 h-full overflow-y-auto">
                    <div className="space-y-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 bg-custom-background-80 grid place-items-center rounded">
                          <EmojiIconPicker
                            label={object.icon ? renderEmoji(object.icon) : "Icon"}
                            onChange={(icon) => {
                              if (typeof icon === "string")
                                setObject((prevData) => ({ ...prevData, icon }));
                            }}
                            value={object.icon}
                            showIconPicker={false}
                          />
                        </div>
                        <Input
                          placeholder="Enter Object Title"
                          value={object.display_name}
                          onChange={(e) =>
                            setObject((prevData) => ({ ...prevData, display_name: e.target.value }))
                          }
                        />
                      </div>
                      <textarea
                        name="objectDescription"
                        id="objectDescription"
                        className="placeholder:text-custom-text-400 text-xs px-3 py-2 rounded bg-custom-background-100 border border-custom-border-200 w-full focus:outline-none"
                        cols={30}
                        rows={5}
                        placeholder="Enter Object Description"
                        value={object.description}
                        onChange={(e) =>
                          setObject((prevData) => ({ ...prevData, description: e.target.value }))
                        }
                      />
                      {object.id && (
                        <div className="text-right">
                          <PrimaryButton onClick={handleUpdateObject} loading={isUpdatingObject}>
                            {isUpdatingObject ? "Saving..." : "Save changes"}
                          </PrimaryButton>
                        </div>
                      )}
                    </div>
                    {object.id && (
                      <div className="px-6 pb-5">
                        <h4 className="font-medium">Attributes</h4>
                        <div className="mt-2 space-y-2">
                          {customAttributes.fetchEntityDetailsLoader ? (
                            <Loader>
                              <Loader.Item height="40px" />
                            </Loader>
                          ) : (
                            Object.keys(customAttributes.entityAttributes[object.id] ?? {})?.map(
                              (attributeId) => {
                                const attribute =
                                  customAttributes.entityAttributes[object.id ?? ""][attributeId];

                                return (
                                  <AttributeForm
                                    key={attributeId}
                                    attributeDetails={attribute}
                                    objectId={object.id ?? ""}
                                    type={attribute.type}
                                  />
                                );
                              }
                            )
                          )}
                          {customAttributes.createEntityAttributeLoader && (
                            <Loader>
                              <Loader.Item height="40px" />
                            </Loader>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    className={`flex items-center gap-3 px-6 py-5 border-t border-custom-border-200 ${
                      object.id ? "justify-between" : "justify-end"
                    }`}
                  >
                    {object.id && (
                      <div className="flex-shrink-0">
                        <TypesDropdown onClick={handleCreateEntityAttribute} />
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <SecondaryButton onClick={handleClose}>Close</SecondaryButton>
                      {!object.id && (
                        <PrimaryButton onClick={handleCreateObject} loading={isCreatingObject}>
                          {isCreatingObject ? "Creating..." : "Create Object"}
                        </PrimaryButton>
                      )}
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    );
  }
);