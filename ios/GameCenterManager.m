//
//  GameCenterManager.m
//  Fortress
//
//  Created by Matthew Steedman on 12/11/15.
//  Copyright © 2015 Facebook. All rights reserved.
//

#import "GameCenterManager.h"
#import "AppDelegate.h"
#import "RCTBridge.h"
#import "RCTEventDispatcher.h"
@import GameKit;

@implementation GameCenterManager

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();


////////////////////////////////////////////////////////////////////////////////
//                             INITIALIZATION                                 //
////////////////////////////////////////////////////////////////////////////////

#pragma mark init

- (id)init {
  NSLog(@"authenticating player...");
  self = [super init];
  
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(didBecomeActive:)
                                               name:UIApplicationDidBecomeActiveNotification
                                             object:nil];
  
  [GKLocalPlayer localPlayer].authenticateHandler = ^(UIViewController *viewController, NSError *error){
    if (viewController != nil)
    {
      NSLog(@"Show auth dialog");
    }
    else if ([GKLocalPlayer localPlayer].authenticated)
    {
      NSLog(@"Player is authenticated");
      [[GKLocalPlayer localPlayer] unregisterAllListeners];
      [[GKLocalPlayer localPlayer] registerListener:self];
    }
    else
    {
      NSLog(@"Player is not authenticated");
    }
  };
  return self;
}

// Called when the app is launched
- (void)didBecomeActive:(NSNotification *)notification;
{
  NSLog(@"Did become active");
  if (self.currentMatch)
  {
    [self.currentMatch loadMatchDataWithCompletionHandler:^(NSData *rawMatchData, NSError *error) {
      if (error)
      {
        NSLog(@"loadMatchData error");
        NSLog(@"%@", error);
      } else {
        NSString* matchData;
        GKTurnBasedMatch *match = self.currentMatch;
        if (rawMatchData.length == 0)
        {
          matchData = @"";
        } else {
          matchData = [[NSString alloc] initWithData:rawMatchData
                                            encoding:NSUTF8StringEncoding];
        }
        GKLocalPlayer *localPlayer = [GKLocalPlayer localPlayer];
        if (self.currentMatch.currentParticipant.player != localPlayer)
        {
          NSDictionary *event = [self createEventFromMatch:match andMatchData:rawMatchData];
          [_bridge.eventDispatcher sendAppEventWithName:@"updateMatchData" body:event]; // PlayView event
        }
      }
    }];
  }
}

////////////////////////////////////////////////////////////////////////////////
//                             EXPORTED METHODS                               //
////////////////////////////////////////////////////////////////////////////////

//RCT_EXPORT_METHOD(newMatch:(NSString *)name location:(NSString *)location)

RCT_EXPORT_METHOD(newMatch)
{
  //TODO: Handle non-logged in players.
  //NSLog(@"Pretending to create an event %@ at %@", name, location);
  NSLog(@"Loading GK Matchmaker view");
  UIViewController *rootController = (UIViewController*)[[(AppDelegate*)
                                    [[UIApplication sharedApplication]delegate] window] rootViewController];
  
  GKMatchRequest *request = [[GKMatchRequest alloc] init];
  request.minPlayers = 2;
  request.maxPlayers = 2;
  
  GKTurnBasedMatchmakerViewController *mmvc = [[GKTurnBasedMatchmakerViewController alloc] initWithMatchRequest:request];
  mmvc.turnBasedMatchmakerDelegate = self;
//  mmvc.showExistingMatches = NO;
  
  [rootController presentViewController:mmvc animated:YES completion:nil];
  self.GKMatchmakerViewControllerActive = YES;
}

RCT_EXPORT_METHOD(clearMatch)
{
  NSLog(@"Clear match");
  self.currentMatch = nil;
}

RCT_EXPORT_METHOD(endMatchInTurnWithMatchData:(NSString *)game)
{
  NSLog(@"End turn with next participants");
  if (self.currentMatch.participants[0].player.playerID == self.currentMatch.currentParticipant.player.playerID)
  {
    self.currentMatch.participants[0].matchOutcome = 2; // Won
    self.currentMatch.participants[1].matchOutcome = 3; // Lost
  } else {
    self.currentMatch.participants[1].matchOutcome = 2; // Won
    self.currentMatch.participants[0].matchOutcome = 3; // Lost
  }
  
  NSData * updatedMatchData = [game dataUsingEncoding:NSUTF8StringEncoding]; //Data
  [self.currentMatch endMatchInTurnWithMatchData:updatedMatchData completionHandler:^(NSError *error) {
    if (error)
    {
      // Handle the error.
    }
  }];
}

RCT_EXPORT_METHOD(endTurnWithNextParticipants:(NSString *)game)
{
  NSLog(@"End turn with next participants");
  
  NSArray* nextPlayer;
  
  if (self.currentMatch.currentParticipant.playerID == self.currentMatch.participants[0].playerID)
  {
    nextPlayer = @[self.currentMatch.participants[1]];
  } else {
    nextPlayer = @[self.currentMatch.participants[0]];
  }
  
  // Game Over:
  //   - Rematch
  //   - Close
//  self.currentMatch.message = @"It's your turn!";
  
  NSData * updatedMatchData = [game dataUsingEncoding:NSUTF8StringEncoding]; //Data
  //NSArray* sortedPlayerOrder = [[self.currentMatch.participants reverseObjectEnumerator] allObjects];
  [self.currentMatch endTurnWithNextParticipants:nextPlayer turnTimeout:GKTurnTimeoutDefault matchData:updatedMatchData completionHandler: ^(NSError *error) {
    if (error)
    {
      NSLog(@"end turn error");
      NSLog(@"%@", error);
    }
  }];
}

////////////////////////////////////////////////////////////////////////////////
//                             EVENT LISTENERS                                //
////////////////////////////////////////////////////////////////////////////////

#pragma mark GKTurnBasedEventListener

- (void)player:(GKPlayer *)player matchEnded:(GKTurnBasedMatch *)match
{
  NSLog(@"match ended");
  int playerIndex;
  if ([GKLocalPlayer localPlayer].playerID == match.participants[0].player.playerID) {
    playerIndex = 0;
  } else {
    playerIndex = 1;
  }
  if (match.participants[playerIndex].matchOutcome == 2) {
    // send win message
  } else if (match.participants[playerIndex].matchOutcome == 3) {
    // send lost message
  }
}

// Called when loading a match from GKTurnBasedMatchMaker - did become active
// Called when the app is open, and the other player updates the match - did not become active
// Called when the app is opened from notification - did become active
- (void)player:(GKPlayer *)player receivedTurnEventForMatch:(GKTurnBasedMatch *)match didBecomeActive:(BOOL)didBecomeActive
{
  NSLog(@"received turn event for match");
  NSDictionary *event = [self createEventFromMatch:match andMatchData:match.matchData];

  // DidBecomeActive when launching from GKTurnBasedMatchmakerViewController
  if (didBecomeActive) {
    NSLog(@"received turn event - did become active");
    // Launch the playView from didfindmatch
    self.currentMatch = match;
    // TODO: Add event for loading match from notification
    if (!self.didFindMatch) {
      self.didFindMatch = YES;
      [_bridge.eventDispatcher sendAppEventWithName:@"didFindMatch" body:event]; // Home event
    } else {
      self.didFindMatch = NO;
    }
    if (self.GKMatchmakerViewControllerActive) {
      UIViewController *rootController = (UIViewController*)[[(AppDelegate*)
                                                              [[UIApplication sharedApplication]delegate] window] rootViewController];
      [rootController dismissViewControllerAnimated:YES completion:nil];
    }
    if (match.matchData.length != 0) {
      [_bridge.eventDispatcher sendAppEventWithName:@"updateMatchData" body:event]; // PlayView event
    }
    // alert: false
  } else {
    NSLog(@"received turn event - did NOT become active");
//        NSLog(@"Current match ID:");
//        NSLog(self.currentMatch.matchID);
//        NSLog(@"turn event match ID:");
//        NSLog(match.matchID);
//    self.currentMatch = match;
    // Update matchdata?
    NSDictionary *event = [self createEventFromMatch:match andMatchData:match.matchData];

    if ([match.matchID isEqualToString:self.currentMatch.matchID]) {
      NSLog(@"match is currentMatch");
      [_bridge.eventDispatcher sendAppEventWithName:@"updateMatchData" body:event];
      self.currentMatch = match;
    } else {
      NSLog(@"currentMatch is NOT match");
      NSLog(@"incoming matchID:");
      NSLog(@"%@", match.matchID);
      NSLog(@"current matchID:");
      NSLog(@"%@", self.currentMatch.matchID);
      // do nothing?
    }
  }

// didBecomeActive
//   - Launch from GKViewController (didFindMatch)
//   - Launch from Push Notification
//     - Update match data
// didNOTBecomeActive
//   - Viewing another match
//     - Do Nothing
//   - Viewing the current match
//     - Send turn alert, update match
//   - Viewing the home screen
//     - Make this match first in the list

// if didBecomeActive
//   launch the playView, regardless of where they are.
// else
//   if match == self.currentMatch
//     send notification, update matchdata in React
//   else
//     do Nothing?

}

- (void)player:(GKPlayer *)player didRequestMatchWithOtherPlayers:(NSArray<GKPlayer *> *)playersToInvite
{
  NSLog(@"Did receive match request with other players");
}

////////////////////////////////////////////////////////////////////////////////
//               TURN BASED MATCHMAKER VIEW CONTROLLER DELEGATE               //
////////////////////////////////////////////////////////////////////////////////

#pragma mark GKTurnBasedMatchmakerViewControllerDelegate

// Called when loading a match from GKTurnBasedMatchmakerViewController
- (void)turnBasedMatchmakerViewController:(GKTurnBasedMatchmakerViewController *)viewController didFindMatch:(GKTurnBasedMatch *)match
{
  NSLog(@"didFindMatch");
  
  self.didFindMatch = YES;
  
  UIViewController *rootController = (UIViewController*)[[(AppDelegate*)
                                                          [[UIApplication sharedApplication]delegate] window] rootViewController];

  NSDictionary *event = [self createEventFromMatch:match andMatchData:match.matchData];
  
  self.currentMatch = match;
  [_bridge.eventDispatcher sendAppEventWithName:@"didFindMatch" body:event];

  [rootController dismissViewControllerAnimated:YES completion:nil];
  
  self.GKMatchmakerViewControllerActive = NO;
  
  NSLog(@"End of didFindMatch");
  
//  [match removeWithCompletionHandler:^(NSError *error) {
//    
//  }];
}

- (void)turnBasedMatchmakerViewController:(GKTurnBasedMatchmakerViewController *)viewController playerQuitForMatch:(GKTurnBasedMatch *)match
{
  NSLog(@"PlayerQuitForMatch");
  
  UIViewController *rootController = (UIViewController*)[[(AppDelegate*)
                                                          [[UIApplication sharedApplication]delegate] window] rootViewController];
  [rootController dismissViewControllerAnimated:YES completion:nil];
}

- (void)turnBasedMatchmakerViewController:(GKTurnBasedMatchmakerViewController *)viewController didFailWithError:(nonnull NSError *)error
{
  NSLog(@"didFailWithError");
  NSLog(@"%@", error);
  
  UIViewController *rootController = (UIViewController*)[[(AppDelegate*)
                                                          [[UIApplication sharedApplication]delegate] window] rootViewController];
  [rootController dismissViewControllerAnimated:YES completion:nil];
}

- (void)turnBasedMatchmakerViewControllerWasCancelled:(GKTurnBasedMatchmakerViewController *)viewController {
  NSLog(@"WasCancelled");
  UIViewController *rootController = (UIViewController*)[[(AppDelegate*)
                                                          [[UIApplication sharedApplication]delegate] window] rootViewController];
  [rootController dismissViewControllerAnimated:YES completion:nil];
}

- (NSDictionary *)createEventFromMatch:(GKTurnBasedMatch *) match andMatchData:(NSData *)rawMatchData {
  NSString* matchData;
  if (rawMatchData.length == 0)
  {
    matchData = @"";
  } else {
    matchData = [[NSString alloc] initWithData:rawMatchData
                                      encoding:NSUTF8StringEncoding];
  }
  
  GKLocalPlayer *localPlayer = [GKLocalPlayer localPlayer];
  
  NSString *yourName = localPlayer.displayName;
  NSString *nameOne = match.participants[0].player.displayName;
  NSString *nameTwo = match.participants[1].player.displayName;
  NSString *theirName = nameOne == yourName ? nameTwo : nameOne;
  theirName = theirName.length == 0 ? @"" : theirName;
  
  NSDictionary *event = @{
                          @"match": @{
                              //      @"creationDate": [NSNumber numberWithDouble:[match.creationDate timeIntervalSinceReferenceDate]],
                              @"matchID": match.matchID,
                              @"yourTurn": match.currentParticipant.player == localPlayer ? @(YES) : @(NO),
                              @"newMatch": match.matchData.length == 0 ? @(YES) : @(NO),
                              @"matchData": matchData,
                              @"yourName": yourName,
                              @"theirName": theirName
                              //      @"message": match.message,
                              //      @"currentParticipant": match.currentParticipant.player.playerID,
                              }
                          };
  return event;
}


@end
