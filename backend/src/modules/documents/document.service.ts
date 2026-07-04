import prisma from "../../lib/prisma.js";
import {Prisma, Role} from "@prisma/client";

export const createDocumentService= async (title: string, ownerId: string) => {
    if (!title.trim()) {
        throw new Error("Title is required");
    }

    const document= await prisma.document.create({
        data: {
            title: title.trim(),
            ownerId,
            content: {
                type: "doc",
                content: [],
            },
        },
        select: {
            id: true,
            title: true,
            ownerId: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return document;
};

export const getDocumentsService= async (userId: string) => {

    const ownedDocuments= await prisma.document.findMany({
        where: {
            ownerId: userId,
        },
        select: {
            id: true,
            title: true,
            ownerId: true,
            createdAt: true,
            updatedAt: true,
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    const sharedDocuments= await prisma.document.findMany({
        where: {
            members: {
                some: {
                    userId,
                },
            },
        },
        select: {
            id: true,
            title: true,
            ownerId: true,
            createdAt: true,
            updatedAt: true,
            owner: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
        orderBy: {
            updatedAt: "desc",
        },
    });

    return {ownedDocuments, sharedDocuments,};
};

export const getDocumentByIdService= async (documentId: string, userId: string) => {
    const document= await prisma.document.findFirst({
        where: {
            id: documentId,
        },
        include: {
            members: true,
        },
    });

    if (!document) {
        throw new Error("Document not found");
    }

    const isOwner= document.ownerId===userId;

    const member= document.members.find((member) => member.userId === userId);

    if (!isOwner && !member) {
        throw new Error("Access denied");
    }

    const canEdit= isOwner || member?.role==="EDITOR";

    return {document, canEdit,};
};

export const updateDocumentService = async (documentId: string, userId: string, title?: string, content?: Prisma.InputJsonValue) => {
    const document= await prisma.document.findFirst({
    where: {
        id: documentId,
    },
    include: {
        members: true,
    },
    });

    if (!document) {
        throw new Error("Document not found");
    }

    const isOwner= document.ownerId===userId;
    const member= document.members.find((member) => member.userId === userId);

    if (!isOwner && (!member || member.role!=="EDITOR")) {
        throw new Error("Access denied");
    }

    const updatedDocument= await prisma.document.update({
        where: {
            id: document.id,
        },
        data: {
            title: title?.trim() ?? document.title,
            content: content ?? (document.content as Prisma.InputJsonValue),
        },
        select: {
            id: true,
            title: true,
            ownerId: true,
            content: true,
            createdAt: true,
            updatedAt: true,
        },
    });
    return updatedDocument;
}

export const shareDocumentService= async (documentId: string, userId: string, email: string, role: Role) => {
    const document= await prisma.document.findFirst({
        where: {
            id: documentId,
            OR: [
                {
                    ownerId: userId,
                },
                {
                    members: {
                        some: {
                            userId,
                        },
                    },
                },
            ],
        },
    });

    if (!document) {
        throw new Error("Document not found");
    }

    const userToShareWith= await prisma.user.findUnique({
        where: {
            email,
        },
    });

    if (!userToShareWith) {
        throw new Error("User not found");
    }

    if (userToShareWith.id===userId) {
        throw new Error("You already own this document");
    }

    const existingMember = await prisma.documentMember.findUnique({
        where: {
            userId_documentId: {
                userId: userToShareWith.id,
                documentId,
            },
        },
    });

    if (existingMember) {
        throw new Error("Document is already shared with this user");
    }

    const member= await prisma.documentMember.create({
        data: {
            userId: userToShareWith.id,
            documentId,
            role,
        },
        select: {
            id: true,
            role: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    return member;
};


export const deleteDocumentService= async (documentId: string, ownerId: string) => {
    const document= await prisma.document.findFirst({
        where: {
            id: documentId,
            ownerId,
        },
    });

    if (!document) {
        throw new Error("Document not found");
    }

    await prisma.document.delete({
        where: {
            id: document.id,
        },
    });
};


export const getDocumentMembersService= async (documentId: string, userId: string) => {
    const document= await prisma.document.findFirst({
        where: {
            id: documentId,
        },
        include: {
            members: true,
        },
    });

    if (!document) {
        throw new Error("Document not found");
    }

    const isOwner= document.ownerId===userId;

    const member= document.members.find((member) => member.userId === userId);

    if (!isOwner && !member) {
        throw new Error("Access denied");
    }

    const owner= await prisma.user.findUnique({
        where: {
            id: document.ownerId,
        },
        select: {
            id: true,
            name: true,
            email: true,
        },
    });

    const members= await prisma.documentMember.findMany({
        where: {
            documentId,
        },
        select: {
            id: true,
            role: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    const allMembers= [
        {
            id: owner!.id,
            role: "OWNER",
            user: owner,
        },
        ...members,
    ];

    return allMembers;
};


export const updateMemberRoleService= async (documentId: string, memberId: string, userId: string, role: "EDITOR" | "VIEWER") => {
    const document= await prisma.document.findUnique({
        where: {
            id: documentId,
        },
    });

    if (!document) {
        throw new Error("Document not found");
    }

    if (document.ownerId !== userId) {
        throw new Error("Only the owner can update roles");
    }

    const member= await prisma.documentMember.update({
        where: {
            id: memberId,
        },
        data: {
            role,
        },
    });

    return member;
};

export const removeMemberService= async (documentId: string, memberId: string, userId: string) => {
    const document= await prisma.document.findUnique({
        where: {
            id: documentId,
        },
    });

    if (!document) {
        throw new Error("Document not found");
    }

    if (document.ownerId!==userId) {
        throw new Error("Only the owner can remove members");
    }

    const member= await prisma.documentMember.findUnique({
        where: {
            id: memberId,
        },
    });

    if (!member) {
        throw new Error("Member not found");
    }

    if (member.documentId!==documentId) {
        throw new Error("Invalid member");
    }

    await prisma.documentMember.delete({
        where: {
            id: memberId,
        },
    });
};