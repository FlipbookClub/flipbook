import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { CommunityHomeScreen } from "@/screens/community/CommunityHomeScreen";
import { ClubDetailScreen } from "@/screens/community/ClubDetailScreen";
import { CreateCommunityScreen } from "@/screens/community/CreateCommunityScreen";
import { EditCommunityScreen } from "@/screens/community/EditCommunityScreen";
import { EditBookScreen } from "@/screens/community/EditBookScreen";
import { InviteMembersScreen } from "@/screens/community/InviteMembersScreen";
import { JoinCommunityScreen } from "@/screens/community/JoinCommunityScreen";
import { InviteAcceptScreen } from "@/screens/community/InviteAcceptScreen";
import { PublishChapterScreen } from "@/screens/community/PublishChapterScreen";
import { ReaderScreen } from "@/screens/reader/ReaderScreen";

import type { Id } from "../../convex/_generated/dataModel";

// Stack inside the Community tab so club navigation (detail, create, join,
// invite-accept, publish) stays scoped to the tab. Reader is registered here
// too so taps from ClubDetail open the PDF in the same nav context.
export type CommunityStackParamList = {
  CommunityHome: undefined;
  CreateCommunity: undefined;
  InviteMembers: { clubId: Id<"clubs">; inviteCode: string };
  JoinCommunity: undefined;
  ClubDetail: { clubId: Id<"clubs"> };
  EditCommunity: { clubId: Id<"clubs"> };
  EditBook: { bookId: Id<"books"> };
  InviteAccept: { inviteCode: string };
  PublishChapter: { clubId: Id<"clubs"> };
  Reader: {
    bookId?: Id<"books">;
    chapterId?: Id<"chapters">;
    jumpToPage?: number;
  };
};

const Stack = createNativeStackNavigator<CommunityStackParamList>();

export function CommunityStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="CommunityHome" component={CommunityHomeScreen} />
      <Stack.Screen name="CreateCommunity" component={CreateCommunityScreen} />
      <Stack.Screen name="InviteMembers" component={InviteMembersScreen} />
      <Stack.Screen name="JoinCommunity" component={JoinCommunityScreen} />
      <Stack.Screen name="ClubDetail" component={ClubDetailScreen} />
      <Stack.Screen name="EditCommunity" component={EditCommunityScreen} />
      <Stack.Screen name="EditBook" component={EditBookScreen} />
      <Stack.Screen name="InviteAccept" component={InviteAcceptScreen} />
      <Stack.Screen name="PublishChapter" component={PublishChapterScreen} />
      <Stack.Screen name="Reader" component={ReaderScreen} options={{ animation: "slide_from_bottom" }} />
    </Stack.Navigator>
  );
}
