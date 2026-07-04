import type {Request, Response} from "express";
import {createDocumentService, getDocumentsService, getDocumentByIdService, updateDocumentService, deleteDocumentService, shareDocumentService, getDocumentMembersService, updateMemberRoleService, removeMemberService,} from "./document.service.js";

export const createDocument = async (req: Request, res: Response) => {
    const {title} = req.body;

    try {
        const document = await createDocumentService(title, req.user.userId);

        return res.status(201).json({
            message: "Document created successfully",
            document,
        });
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message==="Title is required") {
                return res.status(400).json({
                    message: error.message,
                });
            }
        }

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const getDocuments = async (req: Request, res: Response) => {
    try {
        const {ownedDocuments, sharedDocuments,} = await getDocumentsService(req.user.userId);
        return res.status(200).json({ownedDocuments, sharedDocuments,});
    }
    catch {
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const getDocumentById = async (req: Request, res: Response) => {
    try {
        const documentId= req.params.id as string;
        const {document, canEdit,} = await getDocumentByIdService(documentId, req.user.userId);
        return res.status(200).json({document, canEdit,});
    }
    catch (error) {
        if (error instanceof Error) {
            if (error.message==="Document not found") {
                return res.status(404).json({
                    message: error.message,
                });
            }

            if (error.message==="Access denied") {
                return res.status(403).json({
                    message: error.message,
                });
            }
        }

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const updateDocument= async (req: Request, res: Response) => {
    try {
        const documentId= req.params.id as string;
        const {title, content}= req.body;
        const document = await updateDocumentService(documentId, req.user.userId, title, content);

        return res.status(200).json({
            message: "Document updated successfully",
            document,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message==="Document not found") {
                return res.status(404).json({
                    message: error.message,
                });
            }
            if (error.message==="Access denied") {
                return res.status(403).json({
                    message: error.message,
                });
            }
        }

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};


export const shareDocument = async (req: Request, res: Response) => {
    const documentId= req.params.id as string;

    if (!documentId) {
        return res.status(400).json({
            message: "Document ID is required",
        });
    }

    const {email, role}= req.body;

    try {
        const member= await shareDocumentService(documentId, req.user.userId, email, role);

        return res.status(200).json({
            message: "Document shared successfully",
            member,
        });
    } catch (error) {
        if (error instanceof Error) {
            return res.status(400).json({
                message: error.message,
            });
        }

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const deleteDocument= async (req: Request, res: Response) => {
    const documentId= req.params.id as string;

    if (!documentId) {
        return res.status(400).json({
            message: "Document ID is required",
        });
    }

    try {
        await deleteDocumentService(documentId, req.user.userId);

        return res.status(200).json({
            message: "Document deleted successfully",
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message==="Document not found") {
                return res.status(404).json({
                    message: error.message,
                });
            }
        }

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const getDocumentMembers = async (req: Request, res: Response) => {
    const documentId = req.params.id as string;

    if (!documentId) {
        return res.status(400).json({
            message: "Document ID is required",
        });
    }

    try {
        const members = await getDocumentMembersService(documentId, req.user.userId);
        return res.status(200).json({
            members,
        });
    } catch (error) {
        if (error instanceof Error) {
            return res.status(404).json({
                message: error.message,
            });
        }

        return res.status(500).json({
            message: "Internal Server Error",
        });
    }
};

export const updateMemberRole= async (req: Request, res: Response) => {
    try {
        const id= req.params.id as string;
        const memberId= req.params.memberId as string;
        const {role}= req.body;
        const member= await updateMemberRoleService(id, memberId, req.user.userId, role);

        return res.json({
            message: "Role updated",
            member,
        });
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Something went wrong",
        });
    }
};

export const removeMember= async (req: Request, res: Response) => {
    try {
        const id= req.params.id as string;
        const memberId= req.params.memberId as string;

        await removeMemberService(id, memberId, req.user.userId);

        return res.json({
            message: "Member removed",
        });
    } catch (error) {
        return res.status(400).json({
            message:
                error instanceof Error
                    ? error.message
                    : "Something went wrong",
        });
    }
};