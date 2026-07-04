import {Router} from "express";
import {authenticate} from "../../middleware/auth.middleware.js";

import {createDocument, getDocuments, getDocumentById, updateDocument, shareDocument, deleteDocument, getDocumentMembers, updateMemberRole, removeMember,} from "./document.controller.js";

const router = Router();

router.get("/", authenticate, getDocuments);
router.post("/", authenticate, createDocument);

router.get("/:id", authenticate, getDocumentById);
router.patch("/:id", authenticate, updateDocument);
router.delete("/:id", authenticate, deleteDocument);

router.post("/:id/share", authenticate, shareDocument);

router.get("/:id/members", authenticate, getDocumentMembers);

router.patch("/:id/members/:memberId", authenticate, updateMemberRole);
router.delete("/:id/members/:memberId", authenticate, removeMember);

export default router;